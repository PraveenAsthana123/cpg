"""
Celery tasks for the BEV Analytics platform.

Tasks:
    train_model       — load data, train a model, log to MLflow
    predict           — load model from MLflow, run prediction
    run_pipeline      — orchestrate a full ML pipeline for a department
"""
from __future__ import annotations

import logging
import os
import sys
from pathlib import Path
from typing import Any

# Ensure backend package is importable when Celery starts the worker
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from celery import Task  # noqa: E402
from celery.exceptions import SoftTimeLimitExceeded  # noqa: E402

from workers.celery_app import celery_app  # noqa: E402

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Pipeline registry — maps department names to pipeline classes
# ---------------------------------------------------------------------------

def _get_pipeline(department_id: str, pipeline_name: str) -> Any:
    """Lazy import a pipeline class by department / pipeline name."""
    pipeline_map: dict[str, str] = {
        "sales": "ml.pipelines.demand_forecast.DemandForecastPipeline",
        "supply_chain": "ml.pipelines.inventory_optimizer.InventoryOptimizerPipeline",
        "logistics": "ml.pipelines.inventory_optimizer.InventoryOptimizerPipeline",
        "manufacturing": "ml.pipelines.predictive_maintenance.PredictiveMaintenancePipeline",
        "maintenance": "ml.pipelines.predictive_maintenance.PredictiveMaintenancePipeline",
        "retail": "ml.pipelines.demand_forecast.DemandForecastPipeline",
        "customer": "ml.pipelines.customer_segmentation.CustomerSegmentationPipeline",
        "finance": "ml.pipelines.demand_forecast.DemandForecastPipeline",
        "procurement": "ml.pipelines.inventory_optimizer.InventoryOptimizerPipeline",
        "quality": "ml.pipelines.defect_detection.DefectDetectionPipeline",
        "governance": "ml.pipelines.sentiment_analysis.SentimentAnalysisPipeline",
    }

    # Use explicit pipeline_name override if provided
    if pipeline_name and "." in pipeline_name:
        dotted_path = pipeline_name
    else:
        dotted_path = pipeline_map.get(department_id, "")

    if not dotted_path:
        raise ValueError(f"No pipeline registered for department '{department_id}'")

    module_path, class_name = dotted_path.rsplit(".", 1)
    import importlib
    module = importlib.import_module(module_path)
    return getattr(module, class_name)


# ---------------------------------------------------------------------------
# Task: train_model
# ---------------------------------------------------------------------------

@celery_app.task(
    bind=True,
    name="workers.tasks.train_model",
    max_retries=2,
    default_retry_delay=30,
)
def train_model(
    self: Task,
    model_id: str,
    dataset_path: str,
    algorithm: str,
    params: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Train an ML model and log artefacts to MLflow.

    Args:
        model_id:      Logical model identifier (used for experiment naming).
        dataset_path:  Absolute path to the input CSV/parquet file.
        algorithm:     Algorithm name (e.g. "xgboost", "random_forest", "kmeans").
        params:        Optional hyper-parameter overrides.

    Returns:
        dict with keys: run_id, metrics, feature_importance (where applicable).
    """
    import pandas as pd
    from core.config import get_settings

    settings = get_settings()
    params = params or {}

    logger.info(
        "train_model started | model_id=%s algorithm=%s dataset=%s",
        model_id, algorithm, dataset_path,
    )
    self.update_state(state="STARTED", meta={"model_id": model_id, "step": "loading_data"})

    try:
        data_path = Path(dataset_path)
        if not data_path.exists():
            raise FileNotFoundError(f"Dataset not found: {dataset_path}")

        if data_path.suffix.lower() == ".parquet":
            df = pd.read_parquet(data_path)
        else:
            df = pd.read_csv(data_path)

        logger.info("Loaded dataset: %d rows × %d cols", len(df), len(df.columns))
        self.update_state(state="PROGRESS", meta={"step": "training", "rows": len(df)})

        # Select pipeline by algorithm
        algo_lower = algorithm.lower()
        if "forecast" in algo_lower or "xgboost" in algo_lower:
            from ml.pipelines.demand_forecast import DemandForecastPipeline
            pipeline = DemandForecastPipeline(mlflow_tracking_uri=settings.mlflow_tracking_uri)
        elif "inventory" in algo_lower or "random_forest" in algo_lower:
            from ml.pipelines.inventory_optimizer import InventoryOptimizerPipeline
            pipeline = InventoryOptimizerPipeline(mlflow_tracking_uri=settings.mlflow_tracking_uri)
        elif "cluster" in algo_lower or "kmeans" in algo_lower or "segment" in algo_lower:
            from ml.pipelines.customer_segmentation import CustomerSegmentationPipeline
            pipeline = CustomerSegmentationPipeline(mlflow_tracking_uri=settings.mlflow_tracking_uri)
        elif "maintenance" in algo_lower:
            from ml.pipelines.predictive_maintenance import PredictiveMaintenancePipeline
            pipeline = PredictiveMaintenancePipeline(mlflow_tracking_uri=settings.mlflow_tracking_uri)
        elif "defect" in algo_lower or "cnn" in algo_lower:
            from ml.pipelines.defect_detection import DefectDetectionPipeline
            pipeline = DefectDetectionPipeline(mlflow_tracking_uri=settings.mlflow_tracking_uri)
        elif "sentiment" in algo_lower or "nlp" in algo_lower:
            from ml.pipelines.sentiment_analysis import SentimentAnalysisPipeline
            pipeline = SentimentAnalysisPipeline(mlflow_tracking_uri=settings.mlflow_tracking_uri)
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")

        result = pipeline.train(df, experiment_name=model_id, **params)
        logger.info("train_model complete | model_id=%s run_id=%s", model_id, result.get("run_id"))
        return result

    except SoftTimeLimitExceeded:
        logger.error("train_model soft time limit exceeded | model_id=%s", model_id)
        raise
    except Exception as exc:
        logger.exception("train_model failed | model_id=%s error=%s", model_id, exc)
        raise self.retry(exc=exc) from exc


# ---------------------------------------------------------------------------
# Task: predict
# ---------------------------------------------------------------------------

@celery_app.task(
    bind=True,
    name="workers.tasks.predict",
    max_retries=2,
    default_retry_delay=10,
)
def predict(
    self: Task,
    model_id: str,
    model_run_id: str,
    input_data: list[dict[str, Any]],
    algorithm: str = "xgboost",
) -> dict[str, Any]:
    """
    Load a trained model from MLflow and run inference.

    Args:
        model_id:     Logical model identifier (for logging).
        model_run_id: MLflow run ID that holds the model artefact.
        input_data:   List of dicts — each dict is one row of features.
        algorithm:    Algorithm name (controls which pipeline loader to use).

    Returns:
        dict with keys: predictions (list), model_run_id.
    """
    import pandas as pd
    from core.config import get_settings

    settings = get_settings()

    logger.info("predict started | model_id=%s run_id=%s rows=%d", model_id, model_run_id, len(input_data))
    self.update_state(state="STARTED", meta={"model_id": model_id, "step": "loading_model"})

    try:
        df = pd.DataFrame(input_data)

        algo_lower = algorithm.lower()
        if "forecast" in algo_lower or "xgboost" in algo_lower:
            from ml.pipelines.demand_forecast import DemandForecastPipeline
            pipeline = DemandForecastPipeline(mlflow_tracking_uri=settings.mlflow_tracking_uri)
        elif "inventory" in algo_lower or "random_forest" in algo_lower:
            from ml.pipelines.inventory_optimizer import InventoryOptimizerPipeline
            pipeline = InventoryOptimizerPipeline(mlflow_tracking_uri=settings.mlflow_tracking_uri)
        elif "cluster" in algo_lower or "kmeans" in algo_lower or "segment" in algo_lower:
            from ml.pipelines.customer_segmentation import CustomerSegmentationPipeline
            pipeline = CustomerSegmentationPipeline(mlflow_tracking_uri=settings.mlflow_tracking_uri)
        elif "maintenance" in algo_lower:
            from ml.pipelines.predictive_maintenance import PredictiveMaintenancePipeline
            pipeline = PredictiveMaintenancePipeline(mlflow_tracking_uri=settings.mlflow_tracking_uri)
        elif "defect" in algo_lower:
            from ml.pipelines.defect_detection import DefectDetectionPipeline
            pipeline = DefectDetectionPipeline(mlflow_tracking_uri=settings.mlflow_tracking_uri)
        elif "sentiment" in algo_lower or "nlp" in algo_lower:
            from ml.pipelines.sentiment_analysis import SentimentAnalysisPipeline
            pipeline = SentimentAnalysisPipeline(mlflow_tracking_uri=settings.mlflow_tracking_uri)
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")

        predictions = pipeline.predict(model_run_id, df)
        logger.info("predict complete | model_id=%s predictions=%d", model_id, len(predictions))
        return {"predictions": predictions, "model_run_id": model_run_id}

    except SoftTimeLimitExceeded:
        logger.error("predict soft time limit exceeded | model_id=%s", model_id)
        raise
    except Exception as exc:
        logger.exception("predict failed | model_id=%s error=%s", model_id, exc)
        raise self.retry(exc=exc) from exc


# ---------------------------------------------------------------------------
# Task: run_pipeline
# ---------------------------------------------------------------------------

@celery_app.task(
    bind=True,
    name="workers.tasks.run_pipeline",
    max_retries=1,
    default_retry_delay=60,
)
def run_pipeline(
    self: Task,
    department_id: str,
    pipeline_name: str,
    dataset_path: str | None = None,
    params: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Run a full ML pipeline for a department.

    If dataset_path is not provided, looks for sample data under
    /data/kaggle/{department_id}/.

    Args:
        department_id:  One of the 11 BEV department identifiers.
        pipeline_name:  Dotted path to the pipeline class, or empty string
                        to use the registered default.
        dataset_path:   Optional path to dataset CSV. Falls back to sample data.
        params:         Optional hyper-parameter overrides.

    Returns:
        dict with keys: run_id, metrics, and any pipeline-specific fields.
    """
    import pandas as pd
    from core.config import get_settings

    settings = get_settings()
    params = params or {}

    logger.info(
        "run_pipeline started | dept=%s pipeline=%s",
        department_id, pipeline_name,
    )
    self.update_state(state="STARTED", meta={"department": department_id, "step": "initialising"})

    try:
        # Resolve dataset path
        if dataset_path:
            data_file = Path(dataset_path)
        else:
            kaggle_dir = Path(settings.kaggle_dir) / department_id
            csv_files = list(kaggle_dir.glob("*.csv"))
            if not csv_files:
                raise FileNotFoundError(
                    f"No CSV files found in {kaggle_dir}. "
                    "Run 'scripts/generate_sample_data.py' first."
                )
            data_file = csv_files[0]

        logger.info("run_pipeline using dataset: %s", data_file)
        self.update_state(state="PROGRESS", meta={"step": "loading_data", "file": str(data_file)})

        df = pd.read_csv(data_file)

        # Instantiate pipeline
        PipelineClass = _get_pipeline(department_id, pipeline_name)
        pipeline = PipelineClass(mlflow_tracking_uri=settings.mlflow_tracking_uri)

        self.update_state(state="PROGRESS", meta={"step": "training"})
        result = pipeline.train(df, experiment_name=f"{department_id}_pipeline", **params)

        logger.info(
            "run_pipeline complete | dept=%s run_id=%s",
            department_id, result.get("run_id"),
        )
        return {"department": department_id, **result}

    except SoftTimeLimitExceeded:
        logger.error("run_pipeline soft time limit exceeded | dept=%s", department_id)
        raise
    except Exception as exc:
        logger.exception("run_pipeline failed | dept=%s error=%s", department_id, exc)
        raise self.retry(exc=exc) from exc


# ============================================================
# HOLY reference-lifecycle tasks (operator request 2026-05-22)
# Run by Celery beat per the schedule in workers/celery_app.py
# ============================================================


@celery_app.task(bind=True, name="holy.run_structured_lifecycle")
def run_structured_lifecycle(self, *, dataset, target, task_type, dept, pipeline_name,
                              date_cols=None, drop_cols=None, n_trials=10, sample_rows=None):
    """Run the full structured-ML lifecycle (EDA → eval → SHAP) and persist
    manifest + plots under data/eval/<dept>/<pipeline>/<run_id>/.
    """
    from ml.reference.full_lifecycle import FullLifecycle

    logger.info(
        "holy.run_structured_lifecycle | dept=%s pipeline=%s dataset=%s",
        dept, pipeline_name, dataset,
    )
    self.update_state(state="PROGRESS", meta={"step": "starting"})

    runner = FullLifecycle(
        dataset_path=dataset,
        target_col=target,
        task=task_type,
        dept=dept,
        pipeline_name=pipeline_name,
        date_cols=date_cols or [],
        drop_cols=drop_cols or [],
        n_trials=n_trials,
        sample_rows=sample_rows,
        mlflow_tracking_uri=settings.mlflow_tracking_uri,
    )
    manifest = runner.run()
    return {
        "run_id": manifest.run_id,
        "dept": dept,
        "pipeline": pipeline_name,
        "duration_seconds": manifest.duration_seconds,
        "metrics": manifest.metrics,
        "n_plots": len(manifest.plots),
    }


@celery_app.task(bind=True, name="holy.run_rag_lifecycle")
def run_rag_lifecycle(self, *, corpus, dept, pipeline_name, chunking="sentence_aware",
                       llm="gemma3:1b", top_k=4):
    """Run the full RAG lifecycle: chunk → embed → index → retrieve → answer → cite."""
    from ml.reference.rag_lifecycle import RagLifecycle

    logger.info(
        "holy.run_rag_lifecycle | dept=%s pipeline=%s corpus=%s",
        dept, pipeline_name, corpus,
    )
    self.update_state(state="PROGRESS", meta={"step": "starting"})

    ollama_url = os.environ.get("BEV_OLLAMA_HOST", "http://ollama:11434")
    runner = RagLifecycle(
        corpus_paths=corpus,
        dept=dept,
        pipeline_name=pipeline_name,
        chunking=chunking,
        llm_model=llm,
        ollama_url=ollama_url,
        top_k=top_k,
    )
    manifest = runner.run()
    return {
        "run_id": manifest.run_id,
        "dept": dept,
        "pipeline": pipeline_name,
        "duration_seconds": manifest.duration_seconds,
        "n_chunks": manifest.n_chunks,
        "eval": manifest.eval,
        "circuit_breaker_state": manifest.circuit_breaker_state,
    }
