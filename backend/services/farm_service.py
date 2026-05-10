from typing import Any, Optional
from uuid import UUID

from config.constants import FARMER
from db.repositories.farm_repository import FarmRepository
from db.repositories.farmer_repository import FarmerRepository
from schemas.auth import JwtUserClaims


class FarmService:
    def __init__(self) -> None:
        self._farms = FarmRepository()
        self._farmers = FarmerRepository()

    def get_farm(self, farm_id: UUID, user: JwtUserClaims) -> Optional[dict[str, Any]]:
        row = self._farms.get_by_id(str(farm_id))
        if not row:
            return None
        if user.role == FARMER:
            fp = self._farmers.get_by_id(str(row["farmer_profile_id"]))
            if not fp or str(fp.get("user_id")) != user.sub:
                return None
        return row

    def list_for_farmer(self, farmer_id: UUID, user: JwtUserClaims) -> list[dict[str, Any]]:
        fp = self._farmers.get_by_id(str(farmer_id))
        if not fp:
            return []
        if user.role == FARMER and str(fp.get("user_id")) != user.sub:
            return []
        return self._farms.list_by_farmer(str(farmer_id))
