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
