from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from core.config import get_settings
from core.error_handlers import register_error_handlers
from core.logging_config import setup_logging
from core.middleware import CorrelationIdMiddleware, RateLimitMiddleware, SecurityHeadersMiddleware
from database import run_migrations

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    setup_logging()
    logger.info("Starting CPG Analytics Dashboard")

    run_migrations()
    logger.info("Migrations complete")

    from seeds.seed_runner import run_seeds
    run_seeds()
    logger.info("Seed data check complete")

    yield

    logger.info("Shutting down CPG Analytics Dashboard")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="CPG Analytics Dashboard API",
        version="1.0.0",
        description="AI-powered CPG analytics platform covering all 11 business departments",
        lifespan=lifespan,
    )

    # ── Middleware (outermost first — CorrelationId wraps everything) ──────────
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.rate_limit_api)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(CorrelationIdMiddleware)

    # ── Error handlers ─────────────────────────────────────────────────────────
    register_error_handlers(app)

    # ── Routers ────────────────────────────────────────────────────────────────
    from routers.health import router as health_router
    from routers.departments import router as dept_router
    from routers.processes import router as process_router
    from routers.datasets import router as dataset_router
    from routers.models import router as model_router
    from routers.jobs import router as job_router, schedule_router
    from routers.sales import router as sales_router

    app.include_router(health_router)
    app.include_router(dept_router)
    app.include_router(process_router)
    app.include_router(dataset_router)
    app.include_router(model_router)
    app.include_router(job_router)
    app.include_router(schedule_router)
    app.include_router(sales_router)

    return app


app = create_app()
