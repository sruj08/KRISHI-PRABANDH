from typing import Any, Optional

from db.repositories.analytics_repository import AnalyticsRepository
from db.supabase import get_supabase
from schemas.auth import JwtUserClaims


class AnalyticsService:
    def __init__(self) -> None:
        self._repo = AnalyticsRepository()

    def dashboard(self, user: JwtUserClaims) -> dict[str, Any]:
        sb = get_supabase()
        try:
            total = (
                sb.table("surveys").select("*", count="exact").limit(0).execute()
            ).count or 0
            pending = (
                sb.table("surveys")
                .select("*", count="exact")
                .eq("status", "UNDER_REVIEW")
                .limit(0)
                .execute()
            ).count or 0
            comp = (
                sb.table("surveys")
                .select("*", count="exact")
                .eq("status", "APPROVED")
                .limit(0)
                .execute()
            ).count or 0
            farms = (
                sb.table("farms").select("*", count="exact").limit(0).execute()
            ).count or 0
        except Exception:
            total = pending = comp = farms = 0
        return {
            "surveys_total": total,
            "surveys_pending_approval": pending,
            "surveys_compensated": comp,
            "farms_under_survey": farms,
            "viewer_role": user.role,
        }

    def weather(self, user: JwtUserClaims, district_id: Optional[str] = None) -> list[dict[str, Any]]:
        did = district_id or user.district_id
        return self._repo.weather(district_id=did, limit=100)

    def satellite(self, user: JwtUserClaims, district_id: Optional[str] = None) -> list[dict[str, Any]]:
        did = district_id or user.district_id
        return self._repo.satellite(district_id=did, limit=100)
