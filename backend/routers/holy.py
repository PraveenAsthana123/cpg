"""HOLY endpoints — nav (live HOLY_NAV.json) + council (Redis queue/poll)."""
from __future__ import annotations

import json
import os
import time
import uuid
from pathlib import Path
from typing import Any

import redis
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/api/v1/holy", tags=["holy"])

# Locate global-ai-org/ — assume backend runs from /app inside the bev/ project,
# global-ai-org is a sibling at /app/../global-ai-org/ in the container.
# Outside docker: /mnt/deepa/bev/global-ai-org
_CANDIDATES = [
    Path("/global-ai-org"),  # docker volume mount (preferred)
    Path("/app/../global-ai-org"),
    Path("/mnt/deepa/bev/global-ai-org"),
    Path(__file__).resolve().parents[2] / "global-ai-org",
]
GLOBAL_AI_ORG = next((p for p in _CANDIDATES if p.exists()), _CANDIDATES[0])

# Redis (same as agents)
REDIS_URL = os.environ.get("BEV_REDIS_URL", "redis://redis:6379/0")
try:
    _r = redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=2)
    _r.ping()
except Exception:
    _r = None  # surfaced as 503 when needed


@router.get("/nav/{dept}")
def get_nav(dept: str) -> dict:
    """Serve a dept's HOLY_NAV.json live from disk."""
    p = GLOBAL_AI_ORG / "departments" / dept / "HOLY_NAV.json"
    if not p.exists():
        raise HTTPException(404, f"HOLY_NAV.json not found for dept '{dept}' (looked at {p})")
    return json.loads(p.read_text())


@router.get("/depts")
def list_depts() -> dict:
    """List HOLY-enabled departments that have a HOLY_NAV.json file."""
    depts = []
    dept_root = GLOBAL_AI_ORG / "departments"
    if dept_root.exists():
        for d in sorted(dept_root.iterdir()):
            if (d / "HOLY_NAV.json").exists():
                depts.append(d.name)
    return {"departments": depts, "count": len(depts), "global_ai_org": str(GLOBAL_AI_ORG)}


@router.get("/spec/{dept}")
def get_spec(dept: str) -> dict:
    """Serve a dept's HOLY_SPEC.md content (raw text)."""
    p = GLOBAL_AI_ORG / "departments" / dept / "business-layer" / "HOLY_SPEC.md"
    if not p.exists():
        raise HTTPException(404, f"HOLY_SPEC.md not found for dept '{dept}'")
    return {"dept": dept, "markdown": p.read_text()}


# ============================================================
# Council integration: enqueue task + poll for result
# ============================================================

@router.post("/council/ask")
def council_ask(payload: dict) -> dict:
    """Enqueue a council task. Body: {prompt, department?}. Returns task_id."""
    if _r is None:
        raise HTTPException(503, "Redis unavailable")
    prompt = (payload or {}).get("prompt", "").strip()
    if not prompt:
        raise HTTPException(400, "prompt required")
    dept = (payload or {}).get("department", "")
    task_id = f"ui-{uuid.uuid4().hex[:8]}"
    task = {
        "id": task_id,
        "department": dept,
        "prompt": prompt,
        "seeded_at": time.time(),
        "source": "holy-nav-ui",
    }
    _r.lpush("council_tasks", json.dumps(task))
    return {"task_id": task_id, "queue_len": _r.llen("council_tasks")}


@router.get("/council/result/{task_id}")
def council_result(task_id: str) -> dict:
    """Poll for a council task's result. Returns 'pending' if not yet processed."""
    if _r is None:
        raise HTTPException(503, "Redis unavailable")
    # Scan council_done for matching task_id (small list, OK for POC)
    for raw in _r.lrange("council_done", 0, -1):
        try:
            d = json.loads(raw)
            if d.get("task_id") == task_id:
                return {"status": "done", "result": d}
        except Exception:
            continue
    return {"status": "pending", "task_id": task_id}


# ============================================================
# Eval — read manifests + plots produced by the reference pipelines
# ============================================================

# Lifecycle artifacts root: configurable so docker + host both work
_EVAL_ROOT_CANDIDATES = [
    Path("/data/eval"),                                          # docker volume mount
    Path("/mnt/deepa/bev/data/eval"),                           # host
    Path(__file__).resolve().parents[2] / "data" / "eval",      # parent of routers/
]
EVAL_ROOT = next((p for p in _EVAL_ROOT_CANDIDATES if p.exists()), _EVAL_ROOT_CANDIDATES[0])


def _safe_run_dir(dept: str, pipeline: str, run_id: str) -> Path:
    """Resolve + path-traversal guard. Every component must stay under EVAL_ROOT."""
    base = EVAL_ROOT.resolve()
    target = (base / dept / pipeline / run_id).resolve()
    if not str(target).startswith(str(base)):
        raise HTTPException(400, "invalid path component")
    return target


@router.get("/eval/{dept}/{pipeline}/runs")
def list_runs(dept: str, pipeline: str) -> dict:
    """List all completed runs for a pipeline (most recent first)."""
    pdir = EVAL_ROOT / dept / pipeline
    if not pdir.exists():
        return {"dept": dept, "pipeline": pipeline, "runs": []}
    runs = []
    for d in sorted(pdir.iterdir(), reverse=True):
        if d.is_dir() and (d / "manifest.json").exists():
            try:
                m = json.loads((d / "manifest.json").read_text())
                runs.append(
                    {
                        "run_id": d.name,
                        "duration_seconds": m.get("duration_seconds", 0),
                        "n_rows": m.get("n_rows", m.get("n_chunks", 0)),
                        "metrics_summary": list(m.get("metrics", {}).keys())[:6]
                        or list(m.get("eval", {}).keys())[:6],
                    }
                )
            except Exception:
                continue
    return {"dept": dept, "pipeline": pipeline, "runs": runs}


@router.get("/eval/{dept}/{pipeline}/runs/{run_id}/manifest")
def get_manifest(dept: str, pipeline: str, run_id: str) -> dict:
    """Return the full manifest for a specific run."""
    rdir = _safe_run_dir(dept, pipeline, run_id)
    mp = rdir / "manifest.json"
    if not mp.exists():
        raise HTTPException(404, f"manifest not found at {mp}")
    return json.loads(mp.read_text())


@router.get("/eval/{dept}/{pipeline}/runs/{run_id}/plots/{plot_name}")
def get_plot(dept: str, pipeline: str, run_id: str, plot_name: str) -> FileResponse:
    """Serve a PNG plot file. Path-traversal guarded."""
    if not plot_name.endswith(".png") or "/" in plot_name or ".." in plot_name:
        raise HTTPException(400, "invalid plot name")
    rdir = _safe_run_dir(dept, pipeline, run_id)
    pp = rdir / "plots" / plot_name
    if not pp.exists():
        raise HTTPException(404, f"plot not found: {plot_name}")
    return FileResponse(pp, media_type="image/png")


@router.get("/eval/{dept}/{pipeline}/runs/{run_id}/latest")
def get_latest(dept: str, pipeline: str, run_id: str = "latest") -> dict:
    """Convenience: return manifest of newest run (alias for /runs/<id>/manifest)."""
    pdir = EVAL_ROOT / dept / pipeline
    if not pdir.exists():
        raise HTTPException(404, "no runs for this pipeline")
    runs = sorted(
        [d for d in pdir.iterdir() if d.is_dir() and (d / "manifest.json").exists()],
        reverse=True,
    )
    if not runs:
        raise HTTPException(404, "no completed runs")
    target = runs[0] if run_id == "latest" else _safe_run_dir(dept, pipeline, run_id)
    return json.loads((target / "manifest.json").read_text())


# ============================================================
# Simulation — per-process Manual vs Auto runner per §64.34
# ============================================================

_SIM_ROOT_CANDIDATES = [
    Path("/data/eval/sim"),
    Path("/mnt/deepa/bev/data/eval/sim"),
    Path(__file__).resolve().parents[2] / "data" / "eval" / "sim",
]
SIM_ROOT = next((p for p in _SIM_ROOT_CANDIDATES if p.exists()), _SIM_ROOT_CANDIDATES[2])


def _safe_sim_dir(dept: str, process: str, sim_id: str) -> Path:
    base = SIM_ROOT.resolve()
    target = (base / dept / process / sim_id).resolve()
    if not str(target).startswith(str(base)):
        raise HTTPException(400, "invalid path component")
    return target


@router.get("/sim/reference-processes")
def list_reference_processes() -> dict:
    """List the (dept, process) pairs that have a defined simulation."""
    # Import lazily — module pulls in matplotlib, want fast startup
    try:
        from ml.reference.simulation_engine import REFERENCE_PROCESSES
        return {
            "reference_processes": [
                {"dept": d, "process": p, "n_steps": len(steps)}
                for (d, p), steps in REFERENCE_PROCESSES.items()
            ]
        }
    except Exception as exc:
        raise HTTPException(500, f"simulator unavailable: {exc}")


@router.post("/sim/{dept}/{process}/run")
def run_simulation(dept: str, process: str, payload: dict | None = None) -> dict:
    """Trigger a simulation in BOTH modes. Body: {n_inputs, seed}. Returns manifest."""
    try:
        from ml.reference.simulation_engine import (
            ProcessSimulator,
            REFERENCE_PROCESSES,
        )
    except Exception as exc:
        raise HTTPException(500, f"simulator unavailable: {exc}")

    key = (dept, process)
    if key not in REFERENCE_PROCESSES:
        raise HTTPException(
            404,
            f"no reference process for ({dept}, {process}); see /sim/reference-processes",
        )

    body = payload or {}
    n_inputs = int(body.get("n_inputs", 15))
    seed = int(body.get("seed", 42))

    import random as _random
    rng = _random.Random(seed)
    inputs = [
        {
            "lead_id": f"L{i:04d}",
            "company_size": rng.choice(["SMB", "MM", "ENT"]),
            "industry": rng.choice(["fintech", "saas", "retail", "manufacturing"]),
            "score_hint": rng.uniform(0, 1),
            "is_qualified_truth": rng.random() < 0.4,
        }
        for i in range(n_inputs)
    ]

    sim = ProcessSimulator(
        dept=dept,
        process=process,
        steps=REFERENCE_PROCESSES[key],
        inputs=inputs,
        artifacts_root=str(SIM_ROOT),
        seed=seed,
        ground_truth_key="is_qualified_truth",
    )
    manifest = sim.run()
    from dataclasses import asdict
    return asdict(manifest)


@router.get("/sim/{dept}/{process}/runs")
def list_sim_runs(dept: str, process: str) -> dict:
    """List past simulation runs for (dept, process), newest first."""
    pdir = SIM_ROOT / dept / process
    if not pdir.exists():
        return {"dept": dept, "process": process, "runs": []}
    runs = []
    for d in sorted(pdir.iterdir(), reverse=True):
        if d.is_dir() and (d / "manifest.json").exists():
            try:
                m = json.loads((d / "manifest.json").read_text())
                runs.append(
                    {
                        "sim_id": d.name,
                        "duration_wall": m.get("duration_seconds_wall", 0),
                        "n_inputs": m.get("n_inputs", 0),
                        "comparison": m.get("comparison", {}),
                    }
                )
            except Exception:
                continue
    return {"dept": dept, "process": process, "runs": runs}


@router.get("/sim/{dept}/{process}/runs/{sim_id}/manifest")
def get_sim_manifest(dept: str, process: str, sim_id: str) -> dict:
    rdir = _safe_sim_dir(dept, process, sim_id)
    mp = rdir / "manifest.json"
    if not mp.exists():
        raise HTTPException(404, "simulation manifest not found")
    return json.loads(mp.read_text())


# ============================================================
# Role dashboards + reports per §64.37
# ============================================================

ROLE_LIST = [
    "admin", "manager", "team-member", "tester", "security", "devops",
    "ai-reviewer", "digital-transformation", "system-architect",
    "test-architect", "database-architect", "api-architect",
    "data-owner", "ai-strategy", "information-security",
]


@router.get("/roles")
def list_roles() -> dict:
    """All 15 standard roles per global §64.37."""
    return {"roles": ROLE_LIST, "count": len(ROLE_LIST)}


@router.get("/dashboards/{dept}/{role}")
def get_role_dashboard(dept: str, role: str) -> dict:
    """Return synthesized tile + chart payload for (dept, role).
    Tiles/charts use deterministic synthetic data per global §64.37."""
    if role not in ROLE_LIST:
        raise HTTPException(404, f"unknown role '{role}'; see /api/v1/holy/roles")
    try:
        from ml.reference.role_dashboard_catalog import build_dashboard_payload
    except Exception as exc:
        raise HTTPException(500, f"catalog unavailable: {exc}")
    payload = build_dashboard_payload(dept, role)
    if payload is None:
        raise HTTPException(404, f"no catalog entry for role '{role}'")
    return payload


@router.get("/reports/{dept}/{role}")
def get_role_reports(dept: str, role: str) -> dict:
    """Return standard-report list for (dept, role) per §64.37."""
    if role not in ROLE_LIST:
        raise HTTPException(404, f"unknown role '{role}'")
    try:
        from ml.reference.role_dashboard_catalog import build_reports_payload
    except Exception as exc:
        raise HTTPException(500, f"catalog unavailable: {exc}")
    payload = build_reports_payload(dept, role)
    if payload is None:
        raise HTTPException(404, f"no catalog entry for role '{role}'")
    return payload


@router.post("/reports/{dept}/{role}/{report_id}/run")
def run_role_report(dept: str, role: str, report_id: str, payload: dict | None = None) -> dict:
    """Trigger a report run. Logs to Redis audit list (proxy for §38.3 audit row)."""
    if role not in ROLE_LIST:
        raise HTTPException(404, "unknown role")
    run_id = f"report-{uuid.uuid4().hex[:8]}"
    audit = {
        "request_id": run_id,
        "kind": "report_run",
        "dept": dept,
        "role": role,
        "report_id": report_id,
        "timestamp": time.time(),
        "format": (payload or {}).get("format", "PDF"),
        "actor": (payload or {}).get("actor", "unknown"),
    }
    if _r is not None:
        try:
            _r.lpush("holy_report_audit", json.dumps(audit))
            _r.ltrim("holy_report_audit", 0, 999)  # keep last 1000
        except Exception:
            pass
    return {
        "run_id": run_id,
        "status": "queued",
        "dept": dept,
        "role": role,
        "report_id": report_id,
        "audit": audit,
    }


@router.get("/sim/{dept}/{process}/runs/{sim_id}/events")
def get_sim_events(dept: str, process: str, sim_id: str, layer: str | None = None) -> dict:
    """Return all events for a simulation. Optional ?layer=backend|process|data|accuracy|reporting."""
    rdir = _safe_sim_dir(dept, process, sim_id)
    ep = rdir / "events.jsonl"
    if not ep.exists():
        raise HTTPException(404, "events.jsonl not found")
    events: list[dict] = []
    for line in ep.read_text().splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            ev = json.loads(line)
            if layer and ev.get("layer") != layer:
                continue
            events.append(ev)
        except Exception:
            continue
    return {"sim_id": sim_id, "n_events": len(events), "events": events}
