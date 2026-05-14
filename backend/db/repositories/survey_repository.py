from typing import Any, Optional

import db.json_store as store


class SurveyRepository:
    def insert(self, row: dict[str, Any]) -> dict[str, Any]:
        return store.insert("surveys", row)

    def get_by_id(self, survey_id: str) -> Optional[dict[str, Any]]:
        return store.find_one("surveys", id=survey_id)

    def list_page(
        self,
        *,
        offset: int,
        limit: int,
        status: Optional[str] = None,
        farm_id: Optional[str] = None,
        farm_ids: Optional[list[str]] = None,
    ) -> list[dict[str, Any]]:
        rows = store.load("surveys")

        # filter
        if status:
            rows = [r for r in rows if r.get("status") == status]
        if farm_id:
            rows = [r for r in rows if r.get("farm_id") == farm_id]
        if farm_ids is not None:
            rows = [r for r in rows if r.get("farm_id") in farm_ids]

        # sort newest-first
        rows = sorted(rows, key=lambda r: r.get("created_at", ""), reverse=True)
        return rows[offset : offset + limit]

    def update_status(
        self,
        survey_id: str,
        status: str,
        extra: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        patch: dict[str, Any] = {"status": status}
        if extra:
            patch.update(extra)
        updated = store.update("surveys", survey_id, patch)
        if updated is None:
            raise RuntimeError(f"Survey {survey_id!r} not found for status update")
        return updated

    def insert_evidence(self, row: dict[str, Any]) -> dict[str, Any]:
        return store.insert("survey_evidence", row)

    def insert_approval(self, row: dict[str, Any]) -> dict[str, Any]:
        return store.insert("survey_approvals", row)
