from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class JobCreate(BaseModel):
    job_type: str
    model_id: Optional[int] = None


class JobResponse(BaseModel):
    id: int
    model_id: Optional[int] = None
    job_type: str
    status: str
    celery_task_id: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class JobSummary(BaseModel):
    id: int
    job_type: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class JobResultResponse(BaseModel):
    job_id: int
    status: str
    result: Optional[Dict[str, Any]] = None
    completed_at: Optional[datetime] = None
