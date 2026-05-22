"""Celery application factory for BEV Analytics background workers."""
from __future__ import annotations

import sys
import os

# Allow imports from the backend package when running workers directly
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from celery import Celery  # noqa: E402

from core.config import get_settings  # noqa: E402

settings = get_settings()

celery_app = Celery(
    "bev_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,          # hard limit: 60 minutes
    task_soft_time_limit=3000,     # soft limit: 50 minutes — triggers SoftTimeLimitExceeded
    worker_prefetch_multiplier=1,  # fair dispatch — one task per worker at a time
    task_acks_late=True,           # ack after completion so tasks aren't lost on crash
    result_expires=86400,          # results expire after 24 h
)

# ---------------------------------------------------------------------------
# Beat schedule — periodic HOLY reference-pipeline runs
# ---------------------------------------------------------------------------
# Operator request 2026-05-22: full ML + RAG lifecycle must run on a schedule
# so the eval artifacts stay fresh. Disable per-pipeline via env if needed.
# Start beat with: celery -A workers.celery_app beat --loglevel=info
celery_app.conf.beat_schedule = {
    "holy-churn-lifecycle-daily": {
        "task": "holy.run_structured_lifecycle",
        "schedule": 24 * 60 * 60,  # daily
        "kwargs": {
            "dataset": "/data/customer-analytics/WA_Fn-UseC_-Telco-Customer-Churn.csv",
            "target": "Churn",
            "task_type": "classification",
            "dept": "sales",
            "pipeline_name": "churn_reference",
            "drop_cols": ["customerID"],
            "n_trials": 10,
            "sample_rows": 2000,
        },
        "options": {"expires": 12 * 60 * 60},
    },
    "holy-demand-lifecycle-daily": {
        "task": "holy.run_structured_lifecycle",
        "schedule": 24 * 60 * 60,
        "kwargs": {
            "dataset": "/data/kaggle/rossmann/train.csv",
            "target": "Sales",
            "task_type": "regression",
            "dept": "sales",
            "pipeline_name": "demand_forecast_reference",
            "date_cols": ["Date"],
            "drop_cols": ["Store"],
            "n_trials": 10,
            "sample_rows": 10000,
        },
        "options": {"expires": 12 * 60 * 60},
    },
    "holy-rag-lifecycle-daily": {
        "task": "holy.run_rag_lifecycle",
        "schedule": 24 * 60 * 60,
        "kwargs": {
            "corpus": [
                "/data/customer-context",
                "/data/sales-context",
                "/data/supply-chain-context",
            ],
            "dept": "customer-experience",
            "pipeline_name": "rag_reference",
            "chunking": "sentence_aware",
            "llm": "gemma3:1b",
        },
        "options": {"expires": 12 * 60 * 60},
    },
}
