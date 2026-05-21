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
