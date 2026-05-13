from typing import Any, Optional

from db.supabase import get_supabase


class FarmerRepository:
    def __init__(self) -> None:
        self._sb = get_supabase()

    def get_by_id(self, farmer_id: str) -> Optional[dict[str, Any]]:
        res = (
            self._sb.table("farmer_profiles")
            .select("*")
            .eq("id", farmer_id)
            .limit(1)
            .execute()
        )
        if not res.data:
            return None
        return res.data[0]

    def get_by_user_id(self, user_id: str) -> Optional[dict[str, Any]]:
        res = (
            self._sb.table("farmer_profiles")
            .select("*")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if not res.data:
            return None
        return res.data[0]

    def get_by_email(self, email: str) -> Optional[dict[str, Any]]:
        try:
            res = (
                self._sb.table("farmer_profiles")
                .select("*")
                .eq("email", email)
                .limit(1)
                .execute()
            )
            if res.data:
                return res.data[0]
        except Exception:
            pass
        return None
