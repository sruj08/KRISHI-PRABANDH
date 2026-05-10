from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SurveyCreate(BaseModel):
    farm_id: UUID
    scheme_id: UUID
    title: Optional[str] = Field(default=None, max_length=512)
    attrs: Optional[dict[str, Any]] = Field(
        default=None,
        description="Additional survey attributes (maps to `surveys.attrs` JSON column).",
    )


class SurveyOut(BaseModel):
    id: UUID
    farm_id: UUID
    scheme_id: UUID
    status: str
    title: Optional[str] = None
    created_by: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True, "extra": "allow"}


class SurveyEvidenceCreate(BaseModel):
    storage_path: str = Field(..., min_length=3, max_length=1024)
    mime_type: Optional[str] = Field(default=None, max_length=128)
    notes: Optional[str] = Field(default=None, max_length=4000)


class SurveyApprovalCreate(BaseModel):
    decision: str = Field(..., pattern="^(APPROVED|REJECTED|ESCALATED)$")
    notes: Optional[str] = Field(default=None, max_length=4000)
