from typing import Any, Optional

from db.supabase import get_supabase


class AnalyticsRepository:
    def __init__(self) -> None:
        self._sb = get_supabase()

    def weather(self, district_id: Optional[str] = None, limit: int = 100) -> list[dict[str, Any]]:
        q = self._sb.table("weather_analytics").select("*")
        if district_id:
            q = q.eq("district_id", district_id)
        res = q.order("recorded_at", desc=True).limit(limit).execute()
        return list(res.data or [])

    def satellite(self, district_id: Optional[str] = None, limit: int = 100) -> list[dict[str, Any]]:
        q = self._sb.table("satellite_analytics").select("*")
        if district_id:
            q = q.eq("district_id", district_id)
        res = q.order("recorded_at", desc=True).limit(limit).execute()
        return list(res.data or [])
