from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(tags=["Health"])


@router.get("/healthz")
def healthz():
    return JSONResponse(content={"success": True, "message": "ok", "data": {"alive": True}})
