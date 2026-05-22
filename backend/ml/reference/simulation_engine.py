"""HOLY reference: per-process simulation engine (manual vs automatic).

Per operator 2026-05-22 §64.34: every dept must have a simulation tab where
each process runs in both Manual + Automatic modes side-by-side, with all
5 layers visible (backend / process / data / accuracy / reporting).

This module provides a generic ProcessSimulator that:
  - takes a process definition (list of steps + each step's manual+auto config)
  - runs both modes against the same inputs
  - emits a stream of layer-tagged events
  - writes events.jsonl + manifest.json under data/eval/sim/<dept>/<process>/<sim_id>/
  - returns a comparison report (Manual vs Auto on time/cost/error/accuracy)

Reference process: sales / lead_scoring (3 steps: ingest → score → decide).
"""
from __future__ import annotations

import json
import logging
import random
import time
import uuid
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Callable, Literal

logger = logging.getLogger(__name__)

Mode = Literal["manual", "auto"]
Layer = Literal["backend", "process", "data", "accuracy", "reporting"]


# ---------------------------------------------------------------------------
# Event + step + manifest schemas
# ---------------------------------------------------------------------------


@dataclass
class SimEvent:
    timestamp: float
    sim_id: str
    run_mode: Mode
    layer: Layer
    step_index: int
    step_name: str
    actor: str
    duration_ms: float
    status: str  # "ok" | "error" | "escalated"
    message: str
    payload: dict[str, Any] = field(default_factory=dict)


@dataclass
class StepDef:
    """Definition of one step in a process; runs differently in each mode."""

    name: str
    manual_actor: str
    manual_duration_seconds: float
    manual_cost_usd: float
    manual_error_prob: float
    manual_message: str
    auto_actor: str  # e.g. "ml_model:xgb_lead_scorer", "rule_engine", "rag_pipeline"
    auto_duration_seconds: float
    auto_cost_usd: float
    auto_error_prob: float
    auto_confidence: float
    auto_message: str


@dataclass
class SimRunSummary:
    mode: Mode
    total_duration_seconds: float
    total_cost_usd: float
    n_steps: int
    n_errors: int
    n_escalations: int
    mean_confidence: float
    accuracy_estimate: float


@dataclass
class SimManifest:
    sim_id: str
    dept: str
    process: str
    started_at: float
    duration_seconds_wall: float
    n_inputs: int
    seed: int
    artifacts_root: str
    manual: SimRunSummary | None = None
    auto: SimRunSummary | None = None
    comparison: dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# The simulator
# ---------------------------------------------------------------------------


class ProcessSimulator:
    def __init__(
        self,
        *,
        dept: str,
        process: str,
        steps: list[StepDef],
        inputs: list[dict[str, Any]],
        artifacts_root: str | Path = "data/eval/sim",
        seed: int = 42,
        ground_truth_key: str | None = None,
        on_event: Callable[[SimEvent], None] | None = None,
    ) -> None:
        self.dept = dept
        self.process = process
        self.steps = steps
        self.inputs = inputs
        self.seed = seed
        self.ground_truth_key = ground_truth_key
        self.on_event = on_event or (lambda _: None)

        self.sim_id = f"{int(time.time())}-{uuid.uuid4().hex[:6]}"
        self.out = Path(artifacts_root) / dept / process / self.sim_id
        self.out.mkdir(parents=True, exist_ok=True)
        self.events_path = self.out / "events.jsonl"
        # Truncate fresh
        self.events_path.write_text("")

        self.manifest = SimManifest(
            sim_id=self.sim_id,
            dept=dept,
            process=process,
            started_at=time.time(),
            duration_seconds_wall=0.0,
            n_inputs=len(inputs),
            seed=seed,
            artifacts_root=str(self.out),
        )

    # ------------------------------------------------------------------

    def _emit(self, event: SimEvent) -> None:
        with self.events_path.open("a") as f:
            f.write(json.dumps(asdict(event)) + "\n")
        self.on_event(event)

    # ------------------------------------------------------------------
    # Mode runners
    # ------------------------------------------------------------------

    def _run_mode(self, mode: Mode, rng: random.Random) -> SimRunSummary:
        total_duration = 0.0
        total_cost = 0.0
        n_errors = 0
        n_escalations = 0
        confidences: list[float] = []
        correct = 0
        total_decisions = 0

        for input_idx, input_row in enumerate(self.inputs):
            for step_idx, step in enumerate(self.steps):
                if mode == "manual":
                    actor = step.manual_actor
                    dur = step.manual_duration_seconds
                    cost = step.manual_cost_usd
                    err_p = step.manual_error_prob
                    msg = step.manual_message
                    confidence = 0.5  # humans rarely emit calibrated confidence
                else:
                    actor = step.auto_actor
                    dur = step.auto_duration_seconds
                    cost = step.auto_cost_usd
                    err_p = step.auto_error_prob
                    msg = step.auto_message
                    confidence = step.auto_confidence

                # Backend layer event
                self._emit(SimEvent(
                    timestamp=time.time(), sim_id=self.sim_id,
                    run_mode=mode, layer="backend",
                    step_index=step_idx, step_name=step.name,
                    actor=actor, duration_ms=dur * 1000,
                    status="ok",
                    message=f"{actor} invoked for input #{input_idx}",
                    payload={"input_idx": input_idx, "cost_usd": cost},
                ))

                # Process layer event
                self._emit(SimEvent(
                    timestamp=time.time(), sim_id=self.sim_id,
                    run_mode=mode, layer="process",
                    step_index=step_idx, step_name=step.name,
                    actor=actor, duration_ms=dur * 1000,
                    status="ok", message=msg, payload={"input_idx": input_idx},
                ))

                # Simulate possible error
                errored = rng.random() < err_p
                if errored:
                    n_errors += 1
                    # Manual errors escalate; auto errors just retry
                    if mode == "manual":
                        n_escalations += 1
                        status = "escalated"
                    else:
                        status = "error"
                    self._emit(SimEvent(
                        timestamp=time.time(), sim_id=self.sim_id,
                        run_mode=mode, layer="process",
                        step_index=step_idx, step_name=step.name,
                        actor=actor, duration_ms=dur * 1000,
                        status=status,
                        message=f"step failed (error_prob={err_p})",
                    ))

                # Data layer event (sample of input + transformation)
                self._emit(SimEvent(
                    timestamp=time.time(), sim_id=self.sim_id,
                    run_mode=mode, layer="data",
                    step_index=step_idx, step_name=step.name,
                    actor=actor, duration_ms=0,
                    status="ok",
                    message=f"data processed at step {step.name}",
                    payload={
                        "input_sample": {k: v for k, v in list(input_row.items())[:5]},
                        "transformation": "manual review" if mode == "manual" else "auto-extract + score",
                    },
                ))

                # Accuracy layer event — final step's confidence vs ground truth
                if step_idx == len(self.steps) - 1:
                    confidences.append(confidence)
                    if self.ground_truth_key and self.ground_truth_key in input_row:
                        truth = bool(input_row[self.ground_truth_key])
                        # Manual: random with bias toward higher accuracy when error_prob low
                        # Auto: bias by confidence
                        if mode == "manual":
                            prediction_correct = rng.random() < (1 - err_p)
                        else:
                            prediction_correct = rng.random() < confidence
                        if prediction_correct:
                            correct += 1
                        total_decisions += 1
                        self._emit(SimEvent(
                            timestamp=time.time(), sim_id=self.sim_id,
                            run_mode=mode, layer="accuracy",
                            step_index=step_idx, step_name=step.name,
                            actor=actor, duration_ms=0,
                            status="ok",
                            message=f"prediction {'correct' if prediction_correct else 'wrong'} (confidence={confidence:.2f})",
                            payload={"ground_truth": truth, "correct": prediction_correct, "confidence": confidence},
                        ))

                total_duration += dur
                total_cost += cost

        accuracy = (correct / total_decisions) if total_decisions else 0.0
        mean_conf = sum(confidences) / len(confidences) if confidences else 0.0

        return SimRunSummary(
            mode=mode,
            total_duration_seconds=round(total_duration, 3),
            total_cost_usd=round(total_cost, 4),
            n_steps=len(self.steps) * len(self.inputs),
            n_errors=n_errors,
            n_escalations=n_escalations,
            mean_confidence=round(mean_conf, 3),
            accuracy_estimate=round(accuracy, 3),
        )

    # ------------------------------------------------------------------

    def run(self) -> SimManifest:
        wall_start = time.time()
        rng_manual = random.Random(self.seed)
        rng_auto = random.Random(self.seed + 1)

        self.manifest.manual = self._run_mode("manual", rng_manual)
        self.manifest.auto = self._run_mode("auto", rng_auto)

        # Reporting layer — comparison
        m = self.manifest.manual
        a = self.manifest.auto
        comp = {
            "time_saved_seconds": round(m.total_duration_seconds - a.total_duration_seconds, 3),
            "time_saved_pct": round((1 - a.total_duration_seconds / max(m.total_duration_seconds, 0.001)) * 100, 1),
            "cost_saved_usd": round(m.total_cost_usd - a.total_cost_usd, 4),
            "cost_saved_pct": round((1 - a.total_cost_usd / max(m.total_cost_usd, 0.001)) * 100, 1),
            "errors_avoided": m.n_errors - a.n_errors,
            "escalations_avoided": m.n_escalations - a.n_escalations,
            "accuracy_delta_pct": round((a.accuracy_estimate - m.accuracy_estimate) * 100, 1),
        }
        self.manifest.comparison = comp

        # Final reporting events
        for mode, s in (("manual", m), ("auto", a)):
            self._emit(SimEvent(
                timestamp=time.time(), sim_id=self.sim_id,
                run_mode=mode, layer="reporting",
                step_index=-1, step_name="SUMMARY",
                actor="reporting_engine", duration_ms=0,
                status="ok",
                message=f"{mode} mode summary",
                payload=asdict(s),
            ))

        self.manifest.duration_seconds_wall = round(time.time() - wall_start, 3)
        (self.out / "manifest.json").write_text(json.dumps(asdict(self.manifest), indent=2, default=str))
        return self.manifest


# ---------------------------------------------------------------------------
# Reference process — sales lead scoring
# ---------------------------------------------------------------------------


REFERENCE_PROCESSES: dict[tuple[str, str], list[StepDef]] = {
    ("sales", "lead_scoring"): [
        StepDef(
            name="Ingest lead",
            manual_actor="SDR (human)", manual_duration_seconds=300,
            manual_cost_usd=2.50, manual_error_prob=0.05,
            manual_message="SDR reads inbound form, copies to CRM",
            auto_actor="webhook_handler", auto_duration_seconds=0.05,
            auto_cost_usd=0.0001, auto_error_prob=0.001,
            auto_confidence=0.99,
            auto_message="webhook → schema validation → CRM upsert",
        ),
        StepDef(
            name="Score lead",
            manual_actor="SDR Manager (human)", manual_duration_seconds=900,
            manual_cost_usd=12.0, manual_error_prob=0.35,
            manual_message="manager rates 1-10 based on gut feel + spreadsheet",
            auto_actor="ml_model:xgb_lead_scorer", auto_duration_seconds=0.18,
            auto_cost_usd=0.0003, auto_error_prob=0.02,
            auto_confidence=0.82,
            auto_message="features → XGBoost → calibrated score + SHAP",
        ),
        StepDef(
            name="Route to AE",
            manual_actor="Sales Ops (human)", manual_duration_seconds=600,
            manual_cost_usd=6.0, manual_error_prob=0.15,
            manual_message="ops reads queue + assigns AE based on territory map",
            auto_actor="rule_engine", auto_duration_seconds=0.02,
            auto_cost_usd=0.0001, auto_error_prob=0.005,
            auto_confidence=0.97,
            auto_message="rule_engine matches lead to AE per territory + capacity",
        ),
    ],
    ("customer-experience", "ticket_triage"): [
        StepDef(
            name="Read ticket",
            manual_actor="L1 agent (human)", manual_duration_seconds=180,
            manual_cost_usd=1.50, manual_error_prob=0.02,
            manual_message="agent reads ticket body + linked history",
            auto_actor="webhook_handler", auto_duration_seconds=0.03,
            auto_cost_usd=0.0001, auto_error_prob=0.001,
            auto_confidence=0.99,
            auto_message="ticket ingested + normalized",
        ),
        StepDef(
            name="Classify intent",
            manual_actor="L1 agent (human)", manual_duration_seconds=240,
            manual_cost_usd=2.0, manual_error_prob=0.25,
            manual_message="agent picks intent from 30-option dropdown (often wrong)",
            auto_actor="nlp_model:distilbert_intent_classifier", auto_duration_seconds=0.15,
            auto_cost_usd=0.0002, auto_error_prob=0.06,
            auto_confidence=0.88,
            auto_message="DistilBERT → intent class + confidence",
        ),
        StepDef(
            name="Route ticket",
            manual_actor="L1 agent (human)", manual_duration_seconds=120,
            manual_cost_usd=1.0, manual_error_prob=0.10,
            manual_message="agent picks team from routing matrix",
            auto_actor="rule_engine", auto_duration_seconds=0.02,
            auto_cost_usd=0.0001, auto_error_prob=0.01,
            auto_confidence=0.96,
            auto_message="intent + customer-tier → team via rule_engine",
        ),
    ],
}


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def _main() -> None:
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--dept", default="sales")
    parser.add_argument("--process", default="lead_scoring")
    parser.add_argument("--n-inputs", type=int, default=20)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--artifacts-root", default="data/eval/sim")
    args = parser.parse_args()

    key = (args.dept, args.process)
    if key not in REFERENCE_PROCESSES:
        print(f"No reference process for {key}. Available:")
        for k in REFERENCE_PROCESSES:
            print(f"  {k}")
        return

    # Synthetic input rows with ground-truth label for accuracy estimation
    rng = random.Random(args.seed)
    inputs = [
        {
            "lead_id": f"L{i:04d}",
            "company_size": rng.choice(["SMB", "MM", "ENT"]),
            "industry": rng.choice(["fintech", "saas", "retail", "manufacturing"]),
            "score_hint": rng.uniform(0, 1),
            "is_qualified_truth": rng.random() < 0.4,
        }
        for i in range(args.n_inputs)
    ]

    sim = ProcessSimulator(
        dept=args.dept,
        process=args.process,
        steps=REFERENCE_PROCESSES[key],
        inputs=inputs,
        artifacts_root=args.artifacts_root,
        seed=args.seed,
        ground_truth_key="is_qualified_truth",
    )
    manifest = sim.run()
    print(json.dumps(asdict(manifest), indent=2, default=str))


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    _main()
