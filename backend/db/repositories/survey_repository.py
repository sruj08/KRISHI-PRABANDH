from typing import Any, Optional

from db.supabase import get_supabase


class SurveyRepository:
    def __init__(self) -> None:
        self._sb = get_supabase()

    def insert(self, row: dict[str, Any]) -> dict[str, Any]:
        res = self._sb.table("surveys").insert(row).execute()
        if not res.data:
            raise RuntimeError("Insert returned no data")
        return res.data[0]

    def get_by_id(self, survey_id: str) -> Optional[dict[str, Any]]:
        res = self._sb.table("surveys").select("*").eq("id", survey_id).limit(1).execute()
        if not res.data:
            return None
        return res.data[0]

    def list_page(
        self,
        *,
        offset: int,
        limit: int,
        status: Optional[str] = None,
        farm_id: Optional[str] = None,
        farm_ids: Optional[list[str]] = None,
    ) -> list[dict[str, Any]]:
        q = self._sb.table("surveys").select("*")
        if status:
            q = q.eq("status", status)
        if farm_id:
            q = q.eq("farm_id", farm_id)
        if farm_ids:
            q = q.in_("farm_id", farm_ids)
        res = q.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return list(res.data or [])

    def update_status(self, survey_id: str, status: str, extra: Optional[dict[str, Any]] = None) -> dict[str, Any]:
        payload: dict[str, Any] = {"status": status}
        if extra:
            payload.update(extra)
        res = self._sb.table("surveys").update(payload).eq("id", survey_id).execute()
        if not res.data:
            raise RuntimeError("Update returned no data")
        return res.data[0]

    def insert_evidence(self, row: dict[str, Any]) -> dict[str, Any]:
        res = self._sb.table("survey_evidence").insert(row).execute()
        if not res.data:
            raise RuntimeError("Evidence insert returned no data")
        return res.data[0]

    def insert_approval(self, row: dict[str, Any]) -> dict[str, Any]:
        res = self._sb.table("survey_approvals").insert(row).execute()
        if not res.data:
            raise RuntimeError("Approval insert returned no data")
        return res.data[0]
