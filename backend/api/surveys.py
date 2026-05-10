from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from middleware.auth import get_current_user
from schemas.auth import JwtUserClaims
from schemas.survey import SurveyCreate, SurveyEvidenceCreate
from services.survey_service import SurveyService
from utils.response import failure, success

router = APIRouter(prefix="/surveys", tags=["Surveys"])


@router.post("/")
def create_survey(body: SurveyCreate, user: JwtUserClaims = Depends(get_current_user)):
    try:
        created = SurveyService().create(body, user)
        return success("Survey created", created, status_code=201)
    except ValueError as e:
        return failure(str(e), status_code=400)


@router.get("/")
def list_surveys(
    user: JwtUserClaims = Depends(get_current_user),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=200),
    status: Optional[str] = None,
    farm_id: Optional[UUID] = None,
):
    rows = SurveyService().list_surveys(user, offset=offset, limit=limit, status=status, farm_id=farm_id)
    return success("Surveys", {"items": rows, "offset": offset, "limit": limit})


@router.get("/{survey_id}")
def get_survey(survey_id: UUID, user: JwtUserClaims = Depends(get_current_user)):
    row = SurveyService().get(survey_id, user)
    if not row:
        return failure("Survey not found or forbidden", status_code=404)
    return success("Survey", row)


@router.post("/{survey_id}/evidence")
def add_evidence(
    survey_id: UUID,
    body: SurveyEvidenceCreate,
    user: JwtUserClaims = Depends(get_current_user),
):
    try:
        created = SurveyService().add_evidence(survey_id, body, user)
        return success("Evidence recorded", created, status_code=201)
    except ValueError as e:
        return failure(str(e), status_code=400)
