from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class SurveyApprovalOut(BaseModel):
    id: UUID
    survey_id: UUID
    approver_id: UUID
    decision: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"extra": "allow"}
