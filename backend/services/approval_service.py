from typing import Any
from uuid import UUID

from config.constants import (
    CIRCLE_AUTHORITY,
    DISTRICT_AUTHORITY,
    DIVISIONAL_AUTHORITY,
    STATE_AUTHORITY,
    TALUKA_AUTHORITY,
    VILLAGE_AUTHORITY,
)
from db.repositories.survey_repository import SurveyRepository
from schemas.auth import JwtUserClaims
from schemas.survey import SurveyApprovalCreate
from services.audit_service import AuditService

_APPROVERS = frozenset(
    {
        STATE_AUTHORITY,
        DIVISIONAL_AUTHORITY,
        DISTRICT_AUTHORITY,
        TALUKA_AUTHORITY,
        CIRCLE_AUTHORITY,
        VILLAGE_AUTHORITY,
    }
)


class ApprovalService:
    def __init__(self) -> None:
        self._repo = SurveyRepository()
        self._audit = AuditService()

    def approve(self, survey_id: UUID, body: SurveyApprovalCreate, user: JwtUserClaims) -> dict[str, Any]:
        if user.role not in _APPROVERS:
            raise ValueError("Insufficient role for approval")
        survey = self._repo.get_by_id(str(survey_id))
        if not survey:
            raise ValueError("Survey not found")

        approval_row = {
            "survey_id": str(survey_id),
            "approver_id": user.sub,
            "decision": body.decision,
            "notes": body.notes,
        }
        created = self._repo.insert_approval(approval_row)

        new_status = {
            "APPROVED": "APPROVED",
            "REJECTED": "REJECTED",
            "ESCALATED": "UNDER_REVIEW",
        }[body.decision]
        self._repo.update_status(str(survey_id), new_status)

        self._audit.log(
            actor_id=UUID(user.sub),
            action=f"SURVEY_{body.decision}",
            entity_type="survey",
            entity_id=str(survey_id),
            payload={"approval_id": str(created.get("id"))},
        )
        return {"approval": created, "survey_status": new_status}
