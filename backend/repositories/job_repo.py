from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

import psycopg2.extras

from repositories.base import BaseRepository


class JobRepository(BaseRepository):
    """All SQL for the jobs table."""

    def list_all(self, offset: int = 0, limit: int = 50) -> List[dict]:
        with self._connect() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT id, model_id, job_type, status, celery_task_id,
                           result, created_at, completed_at
                    FROM jobs
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    (limit, offset),
                )
                return [dict(row) for row in cur.fetchall()]

    def count(self) -> int:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM jobs")
                return cur.fetchone()[0]

    def get_by_id(self, job_id: int) -> Optional[dict]:
        with self._connect() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT id, model_id, job_type, status, celery_task_id,
                           result, created_at, completed_at
                    FROM jobs
                    WHERE id = %s
                    """,
                    (job_id,),
                )
                row = cur.fetchone()
                return dict(row) if row else None

    def create(self, job_type: str, model_id: Optional[int] = None) -> dict:
        with self._connect() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(
                    """
                    INSERT INTO jobs (job_type, model_id, status)
                    VALUES (%s, %s, 'pending')
                    RETURNING id, model_id, job_type, status, celery_task_id,
                              result, created_at, completed_at
                    """,
                    (job_type, model_id),
                )
                return dict(cur.fetchone())

    def update_status(
        self,
        job_id: int,
        status: str,
        celery_task_id: Optional[str] = None,
        result: Optional[Dict[str, Any]] = None,
    ) -> None:
        with self._connect() as conn:
            with conn.cursor() as cur:
                if status in ("completed", "failed"):
                    cur.execute(
                        """
                        UPDATE jobs
                        SET status = %s,
                            celery_task_id = COALESCE(%s, celery_task_id),
                            result = COALESCE(%s, result),
                            completed_at = NOW()
                        WHERE id = %s
                        """,
                        (status, celery_task_id, json.dumps(result) if result else None, job_id),
                    )
                else:
                    cur.execute(
                        """
                        UPDATE jobs
                        SET status = %s,
                            celery_task_id = COALESCE(%s, celery_task_id)
                        WHERE id = %s
                        """,
                        (status, celery_task_id, job_id),
                    )
