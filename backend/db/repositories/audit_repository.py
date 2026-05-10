from typing import Any

from db.supabase import get_supabase


class AuditRepository:
    def __init__(self) -> None:
        self._sb = get_supabase()

    def append(self, row: dict[str, Any]) -> None:
        self._sb.table("audit_logs").insert(row).execute()
