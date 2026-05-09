from fastapi import APIRouter, HTTPException
from app.domain.mandals.repository import MandalRepository
from app.domain.mandals.service import MandalService
from app.domain.sahayaks.repository import SahayakRepository

router = APIRouter(prefix="/mandals", tags=["Mandals"])

def ok(data):
    return {"success": True, "data": data}

@router.get("")
def list_mandals():
    return ok(MandalRepository.get_all())

@router.get("/{mandal_id}/sahayaks")
def list_sahayaks_in_mandal(mandal_id: str):
    mandal = MandalRepository.get_by_id(mandal_id)
    if not mandal:
        raise HTTPException(status_code=404, detail="Mandal not found")
    sahayaks = SahayakRepository.get_by_mandal(mandal_id)
    return ok({"mandal": mandal, "sahayaks": sahayaks})

@router.get("/{mandal_id}/summary")
def mandal_summary(mandal_id: str):
    summary = MandalService.build_summary(mandal_id)
    return ok(summary)
