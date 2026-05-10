from services.analytics_service import AnalyticsService
from schemas.auth import JwtUserClaims


class SatelliteService:
    def __init__(self) -> None:
        self._a = AnalyticsService()

    def list(self, user: JwtUserClaims, district_id: str | None = None):
        return self._a.satellite(user, district_id)
