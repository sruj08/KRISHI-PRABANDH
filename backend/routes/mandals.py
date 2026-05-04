from fastapi import APIRouter, HTTPException, Query
from utils.loader import (
    load_mandals, find_mandal_by_id,
    get_sahayaks_by_mandal,
    get_applications_by_mandal,
)

router = APIRouter(prefix="/mandals", tags=["Mandals"])


def ok(data):
    return {"success": True, "data": data}


def _build_mandal_summary(mandal_id: str) -> dict:
    apps = get_applications_by_mandal(mandal_id)
    sahayaks = get_sahayaks_by_mandal(mandal_id)

    status_counts: dict[str, int] = {}
    for a in apps:
        s = a.get("status", "Unknown")
        status_counts[s] = status_counts.get(s, 0) + 1

    # Per-sahayak breakdown
    sahayak_breakdown = []
    for s in sahayaks:
        sid = s["sahayak_id"]
        s_apps = [a for a in apps if a.get("sahayak_id") == sid]
        pending = sum(1 for a in s_apps if a.get("status") in ("Applied", "Under Scrutiny"))
        approved = sum(1 for a in s_apps if a.get("status") == "Approved")
        high_priority = sum(
            1 for a in s_apps
            if a.get("status") == "Under Scrutiny" and "Field" in (a.get("remarks") or "")
        )
        sahayak_breakdown.append({
            "sahayak_id": sid,
            "name": s["name"],
            "total": len(s_apps),
            "pending": pending,
            "approved": approved,
            "high_priority": high_priority,
        })

    fraud_alerts = sum(
        1 for a in apps
        if "duplicate" in (a.get("rejection_reason") or "").lower()
    )
    high_priority_total = sum(
        1 for a in apps
        if a.get("status") == "Under Scrutiny" and "Field" in (a.get("remarks") or "")
    )

    return {
        "total_applications": len(apps),
        "by_status": status_counts,
        "fraud_alerts": fraud_alerts,
        "high_priority": high_priority_total,
        "sahayak_count": len(sahayaks),
        "sahayak_breakdown": sahayak_breakdown,
    }


@router.get("")
def list_mandals():
    """Return all mandals."""
    return ok(load_mandals())


@router.get("/{mandal_id}/sahayaks")
def list_sahayaks_in_mandal(mandal_id: str):
    """Return all sahayaks belonging to the given mandal."""
    mandal = find_mandal_by_id(mandal_id)
    if not mandal:
        raise HTTPException(status_code=404, detail="Mandal not found")
    sahayaks = get_sahayaks_by_mandal(mandal_id)
    return ok({"mandal": mandal, "sahayaks": sahayaks})


@router.get("/{mandal_id}/summary")
def mandal_summary(mandal_id: str):
    """Aggregate dashboard stats for a mandal."""
    mandal = find_mandal_by_id(mandal_id)
    if not mandal:
        raise HTTPException(status_code=404, detail="Mandal not found")
    summary = _build_mandal_summary(mandal_id)
    return ok({"mandal": mandal, **summary})
