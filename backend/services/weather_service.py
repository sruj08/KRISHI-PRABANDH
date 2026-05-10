"""Thin wrapper — logic lives in analytics_service / analytics_repository."""

from services.analytics_service import AnalyticsService
from schemas.auth import JwtUserClaims


class WeatherService:
    def __init__(self) -> None:
        self._a = AnalyticsService()

    def list(self, user: JwtUserClaims, district_id: str | None = None):
        return self._a.weather(user, district_id)
