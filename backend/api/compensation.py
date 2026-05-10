from uuid import UUID

from fastapi import APIRouter, Depends

from middleware.auth import get_current_user
from schemas.auth import JwtUserClaims
from services.compensation_service import CompensationService
from utils.response import failure, success

router = APIRouter(prefix="/compensation", tags=["Compensation"])


@router.get("/{survey_id}")
def get_compensation(survey_id: UUID, user: JwtUserClaims = Depends(get_current_user)):
    row = CompensationService().get_for_survey(survey_id, user)
    if not row:
        return failure("Compensation not found or survey inaccessible", status_code=404)
    return success("Compensation", row)
