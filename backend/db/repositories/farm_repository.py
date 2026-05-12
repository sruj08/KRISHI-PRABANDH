from typing import Any, Optional

from db.supabase import get_supabase


class FarmRepository:
    def __init__(self) -> None:
        self._sb = get_supabase()

    def get_by_id(self, farm_id: str) -> Optional[dict[str, Any]]:
        res = self._sb.table("farms").select("*").eq("id", farm_id).limit(1).execute()
        if not res.data:
            return None
        return res.data[0]

    def list_by_farmer(self, farmer_profile_id: str) -> list[dict[str, Any]]:
        res = (
            self._sb.table("farms")
            .select("*")
            .eq("farmer_id", farmer_profile_id)
            .execute()
        )
        return list(res.data or [])
