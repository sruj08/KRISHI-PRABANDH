from typing import Any, Optional

from db.supabase import get_supabase


class CompensationRepository:
    def __init__(self) -> None:
        self._sb = get_supabase()

    def get_by_survey(self, survey_id: str) -> Optional[dict[str, Any]]:
        res = (
            self._sb.table("compensation_payments")
            .select("*")
            .eq("survey_id", survey_id)
            .limit(1)
            .execute()
        )
        if not res.data:
            return None
        return res.data[0]
