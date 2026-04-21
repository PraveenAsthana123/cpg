from __future__ import annotations

import logging
from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException, status

from schemas.ai_explain import ExplainRequest, ExplainResponse
from services.rag_service import (
    CONTEXT_DIR,
    CUSTOMER_CONTEXT_DIR,
    SUPPLY_CHAIN_CONTEXT_DIR,
    RAGService,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


@lru_cache(maxsize=None)
def _rag_for(corpus: str) -> RAGService:
    """One RAGService singleton per corpus. Index builds lazily on first request."""
    if corpus == "supply-chain":
        return RAGService(corpus_dir=SUPPLY_CHAIN_CONTEXT_DIR, eager=False)
    if corpus == "customer":
        return RAGService(corpus_dir=CUSTOMER_CONTEXT_DIR, eager=False)
    # default = sales
    return RAGService(corpus_dir=CONTEXT_DIR, eager=False)


def get_rag_service() -> RAGService:
    # Backwards-compatible: tests or callers that bypass the corpus selector get sales.
    return _rag_for("sales")


@router.post("/explain", response_model=ExplainResponse)
def explain(req: ExplainRequest) -> ExplainResponse:
    svc = _rag_for(req.corpus or "sales")
    try:
        return svc.explain(req)
    except Exception as e:
        logger.exception("RAG pipeline failed")
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI explanation temporarily unavailable: {e}",
        )
