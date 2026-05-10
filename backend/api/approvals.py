from uuid import UUID

from fastapi import APIRouter, Depends

from middleware.auth import get_current_user
from schemas.auth import JwtUserClaims
from schemas.survey import SurveyApprovalCreate
from services.approval_service import ApprovalService
from utils.response import failure, success

router = APIRouter(tags=["Approvals"])


@router.post("/surveys/{survey_id}/approve")
def approve_survey(
    survey_id: UUID,
    body: SurveyApprovalCreate,
    user: JwtUserClaims = Depends(get_current_user),
):
    try:
        out = ApprovalService().approve(survey_id, body, user)
        return success("Approval processed", out)
    except ValueError as e:
        msg = str(e)
        code = 403 if "Insufficient" in msg or "Forbidden" in msg else 404 if "not found" in msg.lower() else 400
        return failure(msg, status_code=code)
