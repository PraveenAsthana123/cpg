"""rbac_middleware — demo-mode RBAC. Reads X-Demo-Role header, enforces matrix.

NOT real auth — no token signing, no session. For demo + portfolio purposes.
Real RBAC is Phase 2b (see roadmap §12).

Permission matrix is a list of (method, path-regex, allowed-roles-set) tuples.
If no entry matches the incoming request, the request is allowed (so health,
docs, departments, processes, datasets, etc. continue to work).

Default role when header absent = "manager" so existing unauthenticated flows
(e.g., server-to-server tests) still work without modification.
"""
from __future__ import annotations

import logging
import re
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

logger = logging.getLogger(__name__)

# ----- Permission matrix for Sales + Supply Chain + AI endpoints -----
# Each entry: (method, path-regex) -> set of roles allowed.
# If no entry matches, request is ALLOWED (so /health, /docs, etc. stay open).

PERMS_MATRIX: list[tuple[str, re.Pattern, set[str]]] = [
    # -------- Sales --------
    ("GET",  re.compile(r"^/api/v1/sales/stores$"),
     {"manager", "team-member", "compliance", "reporting-monitoring"}),
    ("POST", re.compile(r"^/api/v1/sales/forecast$"),
     {"manager", "team-member", "compliance", "reporting-monitoring"}),
    # Simulation is manager-only per spec §10.8.
    ("POST", re.compile(r"^/api/v1/sales/simulate$"),
     {"manager"}),
    ("POST", re.compile(r"^/api/v1/ai/explain$"),
     {"manager", "team-member", "compliance", "reporting-monitoring"}),

    # -------- Supply Chain (Wave 3 η) --------
    ("GET",  re.compile(r"^/api/v1/supply-chain/skus$"),
     {"manager", "team-member", "compliance", "reporting-monitoring"}),
    ("GET",  re.compile(r"^/api/v1/supply-chain/suppliers$"),
     {"manager", "team-member", "compliance", "reporting-monitoring"}),
    ("POST", re.compile(r"^/api/v1/supply-chain/stockout-risk$"),
     {"manager", "team-member", "compliance", "reporting-monitoring"}),
    ("POST", re.compile(r"^/api/v1/supply-chain/eta$"),
     {"manager", "team-member", "compliance", "reporting-monitoring"}),
    # Network simulation is manager-only (same pattern as Sales simulate).
    ("POST", re.compile(r"^/api/v1/supply-chain/simulate$"),
     {"manager"}),

    # -------- Customer (Wave 4 depth-pilot) --------
    # Read-focused analytics — all four roles can view churn predictions.
    ("POST", re.compile(r"^/api/v1/customer/churn-predict$"),
     {"manager", "team-member", "compliance", "reporting-monitoring"}),
    ("GET",  re.compile(r"^/api/v1/customer/churn-top$"),
     {"manager", "team-member", "compliance", "reporting-monitoring"}),
    ("GET",  re.compile(r"^/api/v1/customer/churn-metrics$"),
     {"manager", "team-member", "compliance", "reporting-monitoring"}),
]

# Backwards-compatible alias — earlier commits referenced SALES_PERMS.
SALES_PERMS = PERMS_MATRIX

VALID_ROLES = {"manager", "team-member", "compliance", "reporting-monitoring"}
DEFAULT_ROLE = "manager"


class RBACMiddleware(BaseHTTPMiddleware):
    """Enforces the PERMS_MATRIX against the X-Demo-Role header."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        method = request.method
        path = request.url.path

        match = next(
            (
                (m, rx, roles)
                for (m, rx, roles) in PERMS_MATRIX
                if m == method and rx.match(path)
            ),
            None,
        )

        if match is None:
            # Path not in matrix → allow (covers /health, /docs, /openapi.json, etc.)
            return await call_next(request)

        _, _, allowed = match
        role = request.headers.get("x-demo-role", DEFAULT_ROLE)

        if role not in VALID_ROLES:
            return JSONResponse(
                status_code=400,
                content={
                    "detail": f"Unknown role '{role}'. Valid: {sorted(VALID_ROLES)}",
                    "error_code": "INVALID_ROLE",
                    "correlation_id": getattr(request.state, "correlation_id", ""),
                },
            )

        if role not in allowed:
            logger.info(
                "rbac.denied role=%s method=%s path=%s correlation_id=%s",
                role, method, path,
                getattr(request.state, "correlation_id", ""),
            )
            return JSONResponse(
                status_code=403,
                content={
                    "detail": f"Role '{role}' not permitted on {method} {path}",
                    "error_code": "FORBIDDEN",
                    "correlation_id": getattr(request.state, "correlation_id", ""),
                },
            )

        return await call_next(request)
