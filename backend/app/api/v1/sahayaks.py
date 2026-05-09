from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.domain.sahayaks.repository import SahayakRepository
from app.domain.sahayaks.service import SahayakService
from app.domain.applications.repository import ApplicationRepository

router = APIRouter(prefix="/sahayaks", tags=["Sahayaks"])

def ok(data):
    return {"success": True, "data": data}

@router.get("")
def list_sahayaks(mandal_id: Optional[str] = Query(None)):
    sahayaks = SahayakRepository.get_all(mandal_id=mandal_id)
    return ok(sahayaks)

@router.get("/{sahayak_id}/applications")
def sahayak_applications(
    sahayak_id: str,
    status: Optional[str] = Query(None),
    component: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
):
    sahayak = SahayakRepository.get_by_id(sahayak_id)
    if not sahayak:
        raise HTTPException(status_code=404, detail="Sahayak not found")

    apps = ApplicationRepository.get_all(
        sahayak_id=sahayak_id,
        status=status,
        component=component,
        limit=limit,
        offset=offset
    )
    total = ApplicationRepository.count(
        sahayak_id=sahayak_id,
        status=status,
        component=component
    )
    
    return ok({
        "sahayak": sahayak,
        "total": total,
        "offset": offset,
        "limit": limit,
        "results": apps,
    })

@router.get("/{sahayak_id}/summary")
def sahayak_summary(sahayak_id: str):
    summary = SahayakService.build_summary(sahayak_id)
    return ok(summary)
