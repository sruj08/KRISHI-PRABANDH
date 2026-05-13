from typing import Any, Optional
from uuid import UUID

from config.constants import ROLE_FARMER as FARMER
from db.repositories.farmer_repository import FarmerRepository
from schemas.auth import JwtUserClaims


class FarmerService:
    def __init__(self) -> None:
        self._repo = FarmerRepository()

    def get_profile(self, farmer_id: UUID, user: JwtUserClaims) -> Optional[dict[str, Any]]:
        row = self._repo.get_by_id(str(farmer_id))
        if not row:
            return None
        if user.role == FARMER:
            if str(row.get("user_id")) != user.sub:
                return None
        return row

    def lookup_by_email(self, email: str) -> Optional[dict[str, Any]]:
        return self._repo.get_by_email(email)
