from uuid import UUID

from fastapi import APIRouter, Depends

from middleware.auth import get_current_user
from schemas.auth import JwtUserClaims
from services.farm_service import FarmService
from services.farmer_service import FarmerService
from utils.response import failure, success

router = APIRouter(prefix="/farmers", tags=["Farmers"])


@router.get("/{farmer_id}/farms")
def list_farms(farmer_id: UUID, user: JwtUserClaims = Depends(get_current_user)):
    rows = FarmService().list_for_farmer(farmer_id, user)
    return success("Farms", rows)


@router.get("/{farmer_id}")
def get_farmer(farmer_id: UUID, user: JwtUserClaims = Depends(get_current_user)):
    row = FarmerService().get_profile(farmer_id, user)
    if not row:
        return failure("Farmer not found or forbidden", status_code=404)
    return success("Farmer profile", row)
