from fastapi import APIRouter, HTTPException, Query
from app.domain.vistar.service import VistarService
from app.domain.mandals.repository import MandalRepository
from app.domain.applications.repository import ApplicationRepository
from app.domain.sahayaks.repository import SahayakRepository

router = APIRouter(prefix="/mka", tags=["MKA Supervisory"])

def ok(data):
    return {"success": True, "data": data}

@router.get("/vistar-sessions")
def vistar_sessions(mandal_id: str | None = Query(None)):
    if mandal_id:
        mandal = MandalRepository.get_by_id(mandal_id)
        if not mandal:
            raise HTTPException(status_code=404, detail="Mandal not found")
        sessions = VistarService.get_enriched_sessions(mandal_id)
    else:
        sessions = VistarService.get_enriched_sessions()

    return ok({
        "count": len(sessions),
        "sessions": sessions,
    })

@router.get("/vistar-analytics")
def vistar_analytics(mandal_id: str | None = Query(None)):
    if mandal_id:
        mandal = MandalRepository.get_by_id(mandal_id)
        if not mandal:
            raise HTTPException(status_code=404, detail="Mandal not found")
        analytics = VistarService.compute_mandal_analytics(mandal_id)
        return ok({"mandal": mandal, **analytics})

    mandals = MandalRepository.get_all()
    all_perf   = []
    all_fraud  = []
    total_ses  = 0
    total_rep  = 0
    total_dig  = 0

    for m in mandals:
        a = VistarService.compute_mandal_analytics(m["mandal_id"])
        all_perf.extend(a["sahayak_performance"])
        all_fraud.extend(a["fraud_sessions"])
        total_ses += a["total_sessions"]
        total_rep += a["avg_reported_attendance"] * a["total_sessions"]
        total_dig += a["avg_digital_attendance"]  * a["total_sessions"]

    avg_rep = round(total_rep / total_ses, 1) if total_ses else 0
    avg_dig = round(total_dig / total_ses, 1) if total_ses else 0
    gap_pct = round(((total_rep - total_dig) / total_rep) * 100, 1) if total_rep else 0

    return ok({
        "total_sessions": total_ses,
        "avg_reported_attendance": avg_rep,
        "avg_digital_attendance":  avg_dig,
        "overall_gap_pct": gap_pct,
        "fraud_flagged_count": len(all_fraud),
        "sahayak_performance": all_perf,
        "fraud_sessions": all_fraud,
    })

@router.get("/vistar-fraud-alerts")
def vistar_fraud_alerts(mandal_id: str | None = Query(None)):
    fraud = VistarService.detect_fraud_sessions(mandal_id)
    return ok({
        "count": len(fraud),
        "alerts": fraud,
    })

@router.get("/application-intelligence")
def application_intelligence(mandal_id: str | None = Query(None)):
    if mandal_id:
        mandal = MandalRepository.get_by_id(mandal_id)
        if not mandal:
            raise HTTPException(status_code=404, detail="Mandal not found")
        apps = ApplicationRepository.get_all(mandal_id=mandal_id, limit=10000)
        sahayaks = SahayakRepository.get_by_mandal(mandal_id)
    else:
        apps = ApplicationRepository.get_all(limit=10000)
        sahayaks = SahayakRepository.get_all()

    status_counts: dict[str, int] = {}
    for a in apps:
        s = a.get("status", "Unknown")
        status_counts[s] = status_counts.get(s, 0) + 1

    scheme_counts: dict[str, int] = {}
    for a in apps:
        sc = a.get("scheme_category") or "Other"
        scheme_counts[sc] = scheme_counts.get(sc, 0) + 1

    dup_alerts = [
        {
            "application_id": a.get("application_id"),
            "farmer_id": a.get("farmer_id"),
            "reason": a.get("rejection_reason"),
            "sahayak_id": a.get("sahayak_id"),
        }
        for a in apps
        if "duplicate" in (a.get("rejection_reason") or "").lower()
    ]

    sahayak_load = []
    for s in sahayaks:
        sid = s["sahayak_id"]
        s_apps = [a for a in apps if a.get("sahayak_id") == sid]
        pending = sum(1 for a in s_apps if a.get("status") in ("Applied", "Under Scrutiny"))
        approved = sum(1 for a in s_apps if a.get("status") == "Approved")
        rejected = sum(1 for a in s_apps if a.get("status") == "Rejected")
        sahayak_load.append({
            "sahayak_id": sid,
            "name": s["name"],
            "total": len(s_apps),
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
            "pending_rate": round((pending / len(s_apps)) * 100, 1) if s_apps else 0,
        })

    return ok({
        "total_applications": len(apps),
        "by_status": status_counts,
        "by_scheme_category": scheme_counts,
        "duplicate_alerts": dup_alerts[:20],
        "sahayak_workload": sahayak_load,
    })
