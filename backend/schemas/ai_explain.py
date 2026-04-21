from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ExplainContext(BaseModel):
    """Payload passed from UI — screen + situation details the user wants explained."""
    model_config = ConfigDict(extra="allow")  # UI may pass extra fields; forward them.
    screen: str
    store_id: int | None = None
    metric: str | None = None
    observed: float | None = None
    expected: float | None = None


class ExplainRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question: str = Field(min_length=3, max_length=500)
    context: ExplainContext | None = None
    corpus: Literal["sales", "supply-chain", "customer"] | None = None  # None → 'sales' default.


class Citation(BaseModel):
    chunk_id: str        # e.g. "promo-playbook.md#typical-promo-outcomes"
    source: str          # doc filename
    snippet: str = Field(description="verbatim excerpt (first ~200 chars)")
    score: float = Field(description="hybrid retrieval score 0-1")


class ExplainResponse(BaseModel):
    markdown: str                          # LLM-generated markdown; paragraphs end with [ref N]
    citations: list[Citation]              # numbered N = index+1
    retrieval_time_ms: int
    generation_time_ms: int
    model: str                             # "qwen2.5:latest"
    groundedness: float | None = None      # filled by eval harness, not live endpoint
