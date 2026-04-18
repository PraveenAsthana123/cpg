from __future__ import annotations

import time
import uuid
from collections import defaultdict, deque
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Attaches a correlation ID to every request for end-to-end tracing."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        request.state.correlation_id = correlation_id

        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds security headers to every HTTP response."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Per-IP sliding-window rate limiter.

    Applies different limits to API vs upload endpoints.
    Returns 429 Too Many Requests with a Retry-After header when limit is exceeded.
    """

    # Paths that count toward the upload quota
    _UPLOAD_PATH_PREFIXES: tuple[str, ...] = ("/api/v1/datasets/upload",)

    def __init__(
        self,
        app: ASGIApp,
        requests_per_minute: int = 100,
        upload_requests_per_minute: int = 10,
    ) -> None:
        super().__init__(app)
        self._rpm = requests_per_minute
        self._upload_rpm = upload_requests_per_minute
        # ip -> deque of timestamps (float)
        self._api_windows: dict[str, deque[float]] = defaultdict(deque)
        self._upload_windows: dict[str, deque[float]] = defaultdict(deque)

    def _is_upload_path(self, path: str) -> bool:
        return any(path.startswith(prefix) for prefix in self._UPLOAD_PATH_PREFIXES)

    def _check_limit(
        self, windows: dict[str, deque[float]], ip: str, limit: int
    ) -> tuple[bool, int]:
        """
        Returns (allowed, retry_after_seconds).
        Prunes timestamps older than 60 seconds from the window.
        """
        now = time.monotonic()
        window = windows[ip]

        # Prune old timestamps
        while window and now - window[0] > 60:
            window.popleft()

        if len(window) >= limit:
            oldest = window[0]
            retry_after = max(1, int(60 - (now - oldest)) + 1)
            return False, retry_after

        window.append(now)
        return True, 0

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for health checks
        if request.url.path in ("/api/health", "/health"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        if self._is_upload_path(path):
            allowed, retry_after = self._check_limit(
                self._upload_windows, client_ip, self._upload_rpm
            )
        else:
            allowed, retry_after = self._check_limit(
                self._api_windows, client_ip, self._rpm
            )

        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please slow down.",
                    "error_code": "RATE_LIMIT_EXCEEDED",
                    "correlation_id": getattr(request.state, "correlation_id", ""),
                },
                headers={"Retry-After": str(retry_after)},
            )

        return await call_next(request)
