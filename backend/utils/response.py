from typing import Any, Optional

from fastapi.responses import JSONResponse


def success(message: str, data: Any = None, status_code: int = 200) -> JSONResponse:
    body: dict[str, Any] = {"success": True, "message": message}
    if data is not None:
        body["data"] = data
    return JSONResponse(content=body, status_code=status_code)


def failure(
    error: str,
    details: Optional[Any] = None,
    status_code: int = 400,
) -> JSONResponse:
    body: dict[str, Any] = {"success": False, "error": error}
    if details is not None:
        body["details"] = details
    return JSONResponse(content=body, status_code=status_code)
