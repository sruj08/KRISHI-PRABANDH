from typing import Any, Optional

from db.supabase import get_supabase


class UserRepository:
    def __init__(self) -> None:
        self._sb = get_supabase()

    def get_by_email(self, email: str) -> Optional[dict[str, Any]]:
        res = (
            self._sb.table("users")
            .select("*")
            .eq("email", email)
            .limit(1)
            .execute()
        )
        if not res.data:
            return None
        return res.data[0]

    def get_by_id(self, user_id: str) -> Optional[dict[str, Any]]:
        res = self._sb.table("users").select("*").eq("id", user_id).limit(1).execute()
        if not res.data:
            return None
        return res.data[0]
