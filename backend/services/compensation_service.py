from typing import Any, Optional
from uuid import UUID

from db.repositories.compensation_repository import CompensationRepository
from db.repositories.survey_repository import SurveyRepository
from schemas.auth import JwtUserClaims
from services.survey_service import SurveyService


class CompensationService:
    def __init__(self) -> None:
        self._pay = CompensationRepository()
        self._surveys = SurveyService()

    def get_for_survey(self, survey_id: UUID, user: JwtUserClaims) -> Optional[dict[str, Any]]:
        survey = self._surveys.get(survey_id, user)
        if not survey:
            return None
        return self._pay.get_by_survey(str(survey_id))
