from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from typing import Optional
import base64, datetime

from app.domain.applications.schemas import UpdateStatusRequest
from app.domain.applications.repository import ApplicationRepository
from app.domain.applications.service import ApplicationService

router = APIRouter(prefix="/applications", tags=["Applications"])

def ok(data):
    return {"success": True, "data": data}

@router.get("")
def get_all_applications(
    status: Optional[str] = Query(None),
    component: Optional[str] = Query(None),
    scheme_category: Optional[str] = Query(None),
    farmer_id: Optional[str] = Query(None),
    sahayak_id: Optional[str] = Query(None),
    mandal_id: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
):
    apps = ApplicationRepository.get_all(
        status=status,
        component=component,
        scheme_category=scheme_category,
        farmer_id=farmer_id,
        sahayak_id=sahayak_id,
        mandal_id=mandal_id,
        limit=limit,
        offset=offset
    )
    total = ApplicationRepository.count(
        status=status,
        component=component,
        scheme_category=scheme_category,
        farmer_id=farmer_id,
        sahayak_id=sahayak_id,
        mandal_id=mandal_id
    )
    return ok({"total": total, "offset": offset, "limit": limit, "results": apps})

@router.get("/filter")
def filter_applications(
    status: Optional[str] = Query(None),
    component: Optional[str] = Query(None),
    scheme_category: Optional[str] = Query(None),
):
    apps = ApplicationRepository.get_all(
        status=status,
        component=component,
        scheme_category=scheme_category,
        limit=1000
    )
    return ok(apps)

@router.get("/{application_id}")
def get_application(application_id: str):
    app = ApplicationRepository.get_by_id(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app["allowed_transitions"] = ApplicationService.get_allowed_transitions(app.get("status", ""))
    return ok(app)

@router.post("/{application_id}/status")
def update_application_status(application_id: str, body: UpdateStatusRequest):
    updated = ApplicationService.update_status(application_id, body.new_status, body.remarks)
    return ok(updated)

@router.post("/{application_id}/upload-photo")
async def upload_photo(
    application_id: str,
    file: UploadFile = File(...),
    remarks: Optional[str] = Form(None),
):
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10 MB guard
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")

    b64 = base64.b64encode(content).decode("utf-8")
    mime = file.content_type or "image/jpeg"
    data_uri = f"data:{mime};base64,{b64}"
    timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    
    result = ApplicationService.update_photo(
        application_id=application_id,
        data_uri=data_uri,
        filename=file.filename,
        timestamp=timestamp,
        remarks=remarks
    )
    
    return ok({
        "message": "Photo uploaded successfully",
        "application_id": result["application_id"],
        "filename": result["filename"],
    })
