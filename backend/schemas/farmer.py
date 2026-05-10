from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel


class FarmerProfileOut(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    village_id: Optional[UUID] = None
    created_at: Optional[datetime] = None

    model_config = {"extra": "allow"}
