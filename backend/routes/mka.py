"""
routes/mka.py
Mandal Krishi Adhikari (MKA) supervisory API endpoints.
All routes are read-only supervisory intelligence — no approve/reject actions.
"""
from fastapi import APIRouter, HTTPException, Query
from services.vistar import (
    get_sessions_by_mandal,
    get_all_sessions,
    detect_fraud_sessions,
    compute_sahayak_performance,
    compute_mandal_analytics,
)
from utils.loader import (
    load_mandals, find_mandal_by_id,
    get_sahayaks_by_mandal,
    get_applications_by_mandal,
)

router = APIRouter(prefix="/mka", tags=["MKA Supervisory"])


def ok(data):
    return {"success": True, "data": data}


# ── Vistar Sessions ───────────────────────────────────────────────────────────

@router.get("/vistar-sessions")
def vistar_sessions(mandal_id: str | None = Query(None)):
    """
    Return all Krushi Vistar sessions, optionally scoped to a mandal.
    Each session includes calculated attendance gap and risk level.
    """
    if mandal_id:
        mandal = find_mandal_by_id(mandal_id)
        if not mandal:
            raise HTTPException(status_code=404, detail="Mandal not found")
        sessions = get_sessions_by_mandal(mandal_id)
    else:
        sessions = get_all_sessions()

    return ok({
        "count": len(sessions),
        "sessions": sessions,
    })


@router.get("/vistar-analytics")
def vistar_analytics(mandal_id: str | None = Query(None)):
    """
    Full Krushi Vistar analytics: session stats, sahayak performance,
    fraud detection, and AI-generated insight strings.
    """
    if mandal_id:
        mandal = find_mandal_by_id(mandal_id)
        if not mandal:
            raise HTTPException(status_code=404, detail="Mandal not found")
        analytics = compute_mandal_analytics(mandal_id)
        return ok({"mandal": mandal, **analytics})

    # Cross-mandal aggregate
    mandals    = load_mandals()
    all_perf   = []
    all_fraud  = []
    total_ses  = 0
    total_rep  = 0
    total_dig  = 0

    for m in mandals:
        a = compute_mandal_analytics(m["mandal_id"])
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
    """
    Return only sessions with HIGH or MODERATE attendance fraud risk.
    """
    fraud = detect_fraud_sessions(mandal_id)
    return ok({
        "count": len(fraud),
        "alerts": fraud,
    })


# ── Application Intelligence ─────────────────────────────────────────────────

@router.get("/application-intelligence")
def application_intelligence(mandal_id: str | None = Query(None)):
    """
    Supervisory-level view of applications in the mandal.
    No approve/reject — only aggregate intelligence for MKA monitoring.
    """
    if mandal_id:
        mandal = find_mandal_by_id(mandal_id)
        if not mandal:
            raise HTTPException(status_code=404, detail="Mandal not found")
        apps = get_applications_by_mandal(mandal_id)
        sahayaks = get_sahayaks_by_mandal(mandal_id)
    else:
        apps     = []
        sahayaks = []
        for m in load_mandals():
            apps.extend(get_applications_by_mandal(m["mandal_id"]))
            sahayaks.extend(get_sahayaks_by_mandal(m["mandal_id"]))

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
