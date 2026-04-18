from __future__ import annotations

import logging
from typing import List, Optional

from core.exceptions import NotFoundError, ValidationError
from repositories.job_repo import JobRepository
from schemas.job import JobCreate, JobResponse, JobResultResponse, JobSummary

logger = logging.getLogger(__name__)

_VALID_STATUSES = {"pending", "running", "completed", "failed", "cancelled"}
_VALID_JOB_TYPES = {"training", "prediction", "evaluation", "data_pipeline", "export"}


class JobService:
    def __init__(self, job_repo: JobRepository) -> None:
        self._repo = job_repo

    def list_jobs(self, offset: int, limit: int) -> tuple[List[JobSummary], int]:
        rows = self._repo.list_all(offset=offset, limit=limit)
        total = self._repo.count()
        return [JobSummary(**r) for r in rows], total

    def get_job(self, job_id: int) -> JobResponse:
        row = self._repo.get_by_id(job_id)
        if row is None:
            raise NotFoundError(f"Job {job_id} not found")
        return JobResponse(**row)

    def create_job(self, payload: JobCreate) -> JobResponse:
        if payload.job_type not in _VALID_JOB_TYPES:
            raise ValidationError(
                f"Invalid job_type '{payload.job_type}'. Must be one of: {_VALID_JOB_TYPES}"
            )
        row = self._repo.create(job_type=payload.job_type, model_id=payload.model_id)
        logger.info("Created job id=%d type=%s", row["id"], row["job_type"])
        return JobResponse(**row)

    def get_results(self, job_id: int) -> JobResultResponse:
        row = self._repo.get_by_id(job_id)
        if row is None:
            raise NotFoundError(f"Job {job_id} not found")
        return JobResultResponse(
            job_id=row["id"],
            status=row["status"],
            result=row.get("result"),
            completed_at=row.get("completed_at"),
        )

    def update_status(
        self,
        job_id: int,
        status: str,
        celery_task_id: Optional[str] = None,
        result: Optional[dict] = None,
    ) -> None:
        if status not in _VALID_STATUSES:
            raise ValidationError(f"Invalid status '{status}'")
        if self._repo.get_by_id(job_id) is None:
            raise NotFoundError(f"Job {job_id} not found")
        self._repo.update_status(job_id, status, celery_task_id=celery_task_id, result=result)
