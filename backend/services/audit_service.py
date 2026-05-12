from typing import Any, Optional
from uuid import UUID

from db.repositories.audit_repository import AuditRepository
from utils.helpers import utcnow


class AuditService:
    def __init__(self) -> None:
        self._repo = AuditRepository()

    def log(
        self,
        *,
        actor_id: UUID,
        action: str,
        entity_type: str,
        entity_id: Optional[str] = None,
        payload: Optional[dict[str, Any]] = None,
    ) -> None:
        row: dict[str, Any] = {
            "user_id": str(actor_id),
            "action_type": action,
            "entity_name": entity_type,
            "created_at": utcnow().isoformat(),
        }
        if entity_id is not None:
            row["entity_id"] = entity_id
        if payload is not None:
            row["new_data"] = payload
        self._repo.append(row)
