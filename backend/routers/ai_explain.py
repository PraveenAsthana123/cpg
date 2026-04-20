from __future__ import annotations

import logging
from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException, status

from schemas.ai_explain import ExplainRequest, ExplainResponse
from services.rag_service import RAGService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


@lru_cache(maxsize=1)
def _rag_service() -> RAGService:
    # Lazy — index builds on first request so startup stays fast.
    return RAGService(eager=False)


def get_rag_service() -> RAGService:
    return _rag_service()


@router.post("/explain", response_model=ExplainResponse)
def explain(req: ExplainRequest, svc: RAGService = Depends(get_rag_service)) -> ExplainResponse:
    try:
        return svc.explain(req)
    except Exception as e:
        logger.exception("RAG pipeline failed")
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI explanation temporarily unavailable: {e}",
        )
