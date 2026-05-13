from typing import Any, Optional
from uuid import UUID

from config.constants import ROLE_FARMER as FARMER
from db.repositories.farm_repository import FarmRepository
from db.repositories.farmer_repository import FarmerRepository
from db.repositories.survey_repository import SurveyRepository
from schemas.auth import JwtUserClaims
from schemas.survey import SurveyCreate, SurveyEvidenceCreate
from services.audit_service import AuditService


class SurveyService:
    def __init__(self) -> None:
        self._repo = SurveyRepository()
        self._farms = FarmRepository()
        self._farmers = FarmerRepository()
        self._audit = AuditService()

    def create(self, body: SurveyCreate, user: JwtUserClaims) -> dict[str, Any]:
        farm = self._farms.get_by_id(str(body.farm_id))
        if not farm:
            raise ValueError("Farm not found")
        if user.role == FARMER:
            fp = self._farmers.get_by_id(str(farm["farmer_profile_id"]))
            if not fp or str(fp.get("user_id")) != user.sub:
                raise ValueError("Forbidden")

        row: dict[str, Any] = {
            "farm_id": str(body.farm_id),
            "scheme_id": str(body.scheme_id),
            "status": "DRAFT",
            "created_by": user.sub,
        }
        if body.title:
            row["title"] = body.title
        if body.attrs is not None:
            row["attrs"] = body.attrs
        created = self._repo.insert(row)
        self._audit.log(
            actor_id=UUID(user.sub),
            action="SURVEY_CREATED",
            entity_type="survey",
            entity_id=str(created["id"]),
        )
        return created

    def list_surveys(
        self,
        user: JwtUserClaims,
        *,
        offset: int,
        limit: int,
        status: Optional[str] = None,
        farm_id: Optional[UUID] = None,
    ) -> list[dict[str, Any]]:
        farm_ids: Optional[list[str]] = None
        if user.role == FARMER:
            fp = self._farmers.get_by_user_id(user.sub)
            if not fp:
                return []
            farms = self._farms.list_by_farmer(str(fp["id"]))
            farm_ids = [str(f["id"]) for f in farms]
            if not farm_ids:
                return []

        fid = str(farm_id) if farm_id else None
        return self._repo.list_page(
            offset=offset,
            limit=limit,
            status=status,
            farm_id=fid,
            farm_ids=farm_ids,
        )

    def get(self, survey_id: UUID, user: JwtUserClaims) -> Optional[dict[str, Any]]:
        row = self._repo.get_by_id(str(survey_id))
        if not row:
            return None
        if not self._user_can_read_survey(user, row):
            return None
        return row

    def add_evidence(
        self,
        survey_id: UUID,
        body: SurveyEvidenceCreate,
        user: JwtUserClaims,
    ) -> dict[str, Any]:
        survey = self._repo.get_by_id(str(survey_id))
        if not survey:
            raise ValueError("Survey not found")
        if not self._user_can_write_survey(user, survey):
            raise ValueError("Forbidden")

        ev: dict[str, Any] = {
            "survey_id": str(survey_id),
            "storage_path": body.storage_path,
            "uploaded_by": user.sub,
        }
        if body.mime_type:
            ev["mime_type"] = body.mime_type
        if body.notes:
            ev["notes"] = body.notes
        created = self._repo.insert_evidence(ev)
        self._audit.log(
            actor_id=UUID(user.sub),
            action="SURVEY_EVIDENCE_UPLOADED",
            entity_type="survey_evidence",
            entity_id=str(created.get("id")),
            payload={"survey_id": str(survey_id)},
        )
        return created

    def _user_can_read_survey(self, user: JwtUserClaims, survey: dict[str, Any]) -> bool:
        if user.role == FARMER:
            farm = self._farms.get_by_id(str(survey["farm_id"]))
            if not farm:
                return False
            fp = self._farmers.get_by_id(str(farm["farmer_profile_id"]))
            return bool(fp and str(fp.get("user_id")) == user.sub)
        return True

    def _user_can_write_survey(self, user: JwtUserClaims, survey: dict[str, Any]) -> bool:
        if user.role == FARMER:
            return self._user_can_read_survey(user, survey)
        # TODO: enforce taluka/district hierarchy for officer roles (join farm → village → …).
        return True
