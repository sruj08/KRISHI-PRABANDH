from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel


class FarmOut(BaseModel):
    id: UUID
    farmer_profile_id: UUID
    village_id: Optional[UUID] = None
    area_hectares: Optional[float] = None
    created_at: Optional[datetime] = None

    model_config = {"extra": "allow"}
