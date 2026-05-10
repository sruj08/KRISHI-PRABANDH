from typing import Optional

from fastapi import APIRouter, Depends, Query

from middleware.auth import get_current_user
from schemas.auth import JwtUserClaims
from services.analytics_service import AnalyticsService
from services.satellite_service import SatelliteService
from services.weather_service import WeatherService
from utils.response import success

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
def dashboard(user: JwtUserClaims = Depends(get_current_user)):
    data = AnalyticsService().dashboard(user)
    return success("Dashboard summary", data)


@router.get("/weather")
def weather(
    user: JwtUserClaims = Depends(get_current_user),
    district_id: Optional[str] = Query(None),
):
    rows = WeatherService().list(user, district_id)
    return success("Weather analytics", rows)


@router.get("/satellite")
def satellite(
    user: JwtUserClaims = Depends(get_current_user),
    district_id: Optional[str] = Query(None),
):
    rows = SatelliteService().list(user, district_id)
    return success("Satellite analytics", rows)
