from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from core.dependencies import get_job_service
from schemas.common import PaginatedResponse
from schemas.job import JobCreate, JobResponse, JobResultResponse, JobSummary
from services.job_service import JobService

router = APIRouter(prefix="/api/v1/jobs", tags=["jobs"])


@router.get("", response_model=PaginatedResponse[JobSummary])
def list_jobs(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    service: JobService = Depends(get_job_service),
) -> PaginatedResponse[JobSummary]:
    items, total = service.list_jobs(offset=offset, limit=limit)
    return PaginatedResponse(items=items, total=total, offset=offset, limit=limit)


@router.post("", response_model=JobResponse, status_code=201)
def create_job(
    payload: JobCreate,
    service: JobService = Depends(get_job_service),
) -> JobResponse:
    return service.create_job(payload)


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: int,
    service: JobService = Depends(get_job_service),
) -> JobResponse:
    return service.get_job(job_id)


@router.get("/{job_id}/results", response_model=JobResultResponse)
def get_job_results(
    job_id: int,
    service: JobService = Depends(get_job_service),
) -> JobResultResponse:
    return service.get_results(job_id)
