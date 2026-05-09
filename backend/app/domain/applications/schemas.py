from pydantic import BaseModel
from typing import Optional, Any

class ApplicationBase(BaseModel):
    farmer_id: str
    scheme_name: str = ""
    scheme_category: str = ""
    component: str = ""
    application_date: str = ""
    status: str = ""
    l1_officer_id: str = ""
    l2_officer_id: str = ""
    remarks: str = ""
    rejection_reason: str = ""
    sahayak_id: Optional[str] = None
    mandal_id: Optional[str] = None
    photo: Optional[str] = None
    photo_filename: Optional[str] = None
    photo_uploaded_at: Optional[str] = None

class Application(ApplicationBase):
    application_id: str

class UpdateStatusRequest(BaseModel):
    new_status: str
    remarks: Optional[str] = None

class ApplicationListResponse(BaseModel):
    total: int
    offset: int
    limit: int
    results: list[Application]
