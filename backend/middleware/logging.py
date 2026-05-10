import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

log = logging.getLogger("krishi.api")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        rid = str(uuid.uuid4())[:8]
        t0 = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            log.exception("request_failed rid=%s path=%s", rid, request.url.path)
            raise
        ms = (time.perf_counter() - t0) * 1000
        log.info(
            "rid=%s %s %s -> %s %.1fms",
            rid,
            request.method,
            request.url.path,
            getattr(response, "status_code", "?"),
            ms,
        )
        return response
