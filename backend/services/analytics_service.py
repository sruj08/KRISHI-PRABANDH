from typing import Any, Optional

import db.json_store as store
from db.repositories.analytics_repository import AnalyticsRepository
from schemas.auth import JwtUserClaims


class AnalyticsService:
    def __init__(self) -> None:
        self._repo = AnalyticsRepository()

    def dashboard(self, user: JwtUserClaims) -> dict[str, Any]:
        try:
            total = store.count("surveys")
            pending = store.count("surveys", status="UNDER_REVIEW")
            comp = store.count("surveys", status="APPROVED")
            farms = store.count("farms")
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
