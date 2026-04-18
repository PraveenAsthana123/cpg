from __future__ import annotations

import logging
from contextlib import contextmanager
from functools import lru_cache
from typing import Generator

import psycopg2
import psycopg2.extras
from psycopg2.extensions import connection as PgConnection

from backend.core.config import Settings, get_settings

logger = logging.getLogger(__name__)


def get_cached_settings() -> Settings:
    """FastAPI Depends() factory — returns the cached Settings singleton."""
    return get_settings()


@contextmanager
def get_db_connection() -> Generator[PgConnection, None, None]:
    """
    Context manager that opens a psycopg2 connection to PostgreSQL and
    ensures it is always closed, even on error.

    Usage:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute("SELECT 1")
    """
    settings = get_settings()
    conn: PgConnection | None = None
    try:
        conn = psycopg2.connect(
            host=settings.postgres_host,
            port=settings.postgres_port,
            dbname=settings.postgres_db,
            user=settings.postgres_user,
            password=settings.postgres_password,
            connect_timeout=10,
        )
        yield conn
        conn.commit()
    except psycopg2.Error:
        if conn is not None:
            conn.rollback()
        logger.exception("Database connection error")
        raise
    finally:
        if conn is not None:
            conn.close()
