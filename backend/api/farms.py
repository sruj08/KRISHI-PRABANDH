from uuid import UUID

from fastapi import APIRouter, Depends

from middleware.auth import get_current_user
from schemas.auth import JwtUserClaims
from services.farm_service import FarmService
from utils.response import failure, success

router = APIRouter(prefix="/farms", tags=["Farms"])


@router.get("/{farm_id}")
def get_farm(farm_id: UUID, user: JwtUserClaims = Depends(get_current_user)):
    row = FarmService().get_farm(farm_id, user)
    if not row:
        return failure("Farm not found or forbidden", status_code=404)
    return success("Farm", row)
