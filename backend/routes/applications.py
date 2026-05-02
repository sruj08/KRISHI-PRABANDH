from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from typing import Optional
import base64, datetime
from utils.loader import load_applications, save_applications, find_by_id
from models.schemas import UpdateStatusRequest
from services.workflow import update_status, get_allowed_transitions

router = APIRouter(prefix="/applications", tags=["Applications"])

def ok(data):
    return {"success": True, "data": data}

@router.get("")
def get_all_applications(
    status: str | None = Query(None),
    component: str | None = Query(None),
    scheme_category: str | None = Query(None),
    farmer_id: str | None = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
):
    apps = load_applications()
    if status:
        apps = [a for a in apps if a.get("status", "").lower() == status.lower()]
    if component:
        apps = [a for a in apps if component.lower() in a.get("component", "").lower()]
    if scheme_category:
        apps = [a for a in apps if a.get("scheme_category", "").lower() == scheme_category.lower()]
    if farmer_id:
        apps = [a for a in apps if a.get("farmer_id", "") == farmer_id]
    total = len(apps)
    return ok({"total": total, "offset": offset, "limit": limit, "results": apps[offset: offset + limit]})

@router.get("/filter")
def filter_applications(
    status: str | None = Query(None),
    component: str | None = Query(None),
    scheme_category: str | None = Query(None),
):
    apps = load_applications()
    if status:
        apps = [a for a in apps if a.get("status", "").lower() == status.lower()]
    if component:
        apps = [a for a in apps if component.lower() in a.get("component", "").lower()]
    if scheme_category:
        apps = [a for a in apps if a.get("scheme_category", "").lower() == scheme_category.lower()]
    return ok(apps)

@router.get("/{application_id}")
def get_application(application_id: str):
    app = find_by_id(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app["allowed_transitions"] = get_allowed_transitions(app.get("status", ""))
    return ok(app)

@router.post("/{application_id}/status")
def update_application_status(application_id: str, body: UpdateStatusRequest):
    updated = update_status(application_id, body.new_status, body.remarks)
    return ok(updated)

@router.post("/{application_id}/upload-photo")
async def upload_photo(
    application_id: str,
    file: UploadFile = File(...),
    remarks: Optional[str] = Form(None),
):
    app = find_by_id(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10 MB guard
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")

    b64 = base64.b64encode(content).decode("utf-8")
    mime = file.content_type or "image/jpeg"
    data_uri = f"data:{mime};base64,{b64}"

    apps = load_applications()
    for a in apps:
        if a.get("application_id") == application_id:
            timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
            a["photo"] = data_uri
            a["photo_filename"] = file.filename
            a["photo_uploaded_at"] = timestamp
            new_remarks = remarks or "Photo uploaded for verification"
            existing = a.get("remarks", "")
            a["remarks"] = f"{existing}; {new_remarks}".lstrip("; ")
            break

    save_applications(apps)
    return ok({
        "message": "Photo uploaded successfully",
        "application_id": application_id,
        "filename": file.filename,
    })

