from collections import Counter
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Query

from api.dependencies import get_evidence_repo
from config.constants import DISTRICT_AUTHORITY, STATE_AUTHORITY, TALUKA_AUTHORITY
from middleware.auth import get_current_user
from middleware.roles import require_roles
from schemas.auth import JwtUserClaims
from services.analytics_service import AnalyticsService
from services.satellite_service import SatelliteService
from services.weather_service import WeatherService
from utils.evidence_geo import extract_geo_context
from utils.response import success

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _aggregate_risk_factors(records: List[dict[str, Any]]) -> List[dict[str, Any]]:
    counts: Counter[str] = Counter()
    for rec in records:
        factors = rec.get("risk_factors") or []
        if isinstance(factors, str):
            continue
        if not isinstance(factors, list):
            continue
        for f in factors:
            if isinstance(f, str) and f.strip():
                counts[f.strip()] += 1
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    return [{"factor": k, "count": v} for k, v in ranked[:25]]


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


@router.get("/fraud-heatmap")
def fraud_heatmap(
    district_id: Optional[str] = Query(None),
    user: JwtUserClaims = Depends(require_roles(DISTRICT_AUTHORITY, STATE_AUTHORITY)),
    evidence_repo: Any = Depends(get_evidence_repo),
):
    """Village-level concentration of high-risk evidence (DAO / State dashboards)."""
    scoped_district = district_id or user.district_id
    flagged = evidence_repo.get_flagged(min_risk_score=50, district_id=scoped_district)
    village_counts: Dict[str, int] = {}
    for record in flagged:
        vname, _, _ = extract_geo_context(record)
        village = vname or "Unknown"
        village_counts[village] = village_counts.get(village, 0) + 1

    heatmap_data = [
        {"village": v, "high_risk_count": c}
        for v, c in sorted(village_counts.items(), key=lambda x: -x[1])
    ]
    return success("Fraud heatmap", {"heatmap_data": heatmap_data})


@router.get("/risk-summary")
def risk_summary(
    taluka_id: Optional[str] = Query(None),
    district_id: Optional[str] = Query(None),
    user: JwtUserClaims = Depends(require_roles(TALUKA_AUTHORITY, DISTRICT_AUTHORITY, STATE_AUTHORITY)),
    evidence_repo: Any = Depends(get_evidence_repo),
):
    """Aggregated risk buckets for TAO / DAO dashboards (processed evidence only)."""
    scoped_taluka = taluka_id or user.taluka_id
    scoped_district = district_id or user.district_id
    rows = evidence_repo.list_for_risk_summary(taluka_id=scoped_taluka, district_id=scoped_district)
    safe = sum(1 for r in rows if int(r.get("risk_score") or 0) <= 20)
    review = sum(1 for r in rows if 20 < int(r.get("risk_score") or 0) <= 50)
    high_risk = sum(1 for r in rows if int(r.get("risk_score") or 0) > 50)
    return success(
        "Risk summary",
        {
            "total_processed": len(rows),
            "safe": safe,
            "needs_review": review,
            "high_risk": high_risk,
            "common_risk_factors": _aggregate_risk_factors(rows),
        },
    )
