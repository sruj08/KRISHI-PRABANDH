from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class Application(BaseModel):
    application_id: str
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

class ApplicationWithPriority(Application):
    priority: str = "NORMAL"

class UpdateStatusRequest(BaseModel):
    new_status: str
    remarks: Optional[str] = None

class AuditLog(BaseModel):
    action: str
    application_id: str
    officer_id: Optional[str] = "system"
    details: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SuccessResponse(BaseModel):
    success: bool = True
    data: Any = None
