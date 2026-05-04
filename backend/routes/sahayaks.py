from fastapi import APIRouter, HTTPException, Query
from utils.loader import (
    load_sahayaks, find_sahayak_by_id,
    get_applications_by_sahayak,
)

router = APIRouter(prefix="/sahayaks", tags=["Sahayaks"])


def ok(data):
    return {"success": True, "data": data}


def _build_sahayak_summary(sahayak_id: str) -> dict:
    apps = get_applications_by_sahayak(sahayak_id)

    status_counts: dict[str, int] = {}
    for a in apps:
        s = a.get("status", "Unknown")
        status_counts[s] = status_counts.get(s, 0) + 1

    high_priority = sum(
        1 for a in apps
        if a.get("status") == "Under Scrutiny" and "Field" in (a.get("remarks") or "")
    )
    fraud_alerts = sum(
        1 for a in apps
        if "duplicate" in (a.get("rejection_reason") or "").lower()
    )

    return {
        "total_applications": len(apps),
        "by_status": status_counts,
        "by_priority": {
            "HIGH": high_priority,
            "MEDIUM": status_counts.get("Applied", 0),
            "NORMAL": status_counts.get("Approved", 0),
            "LOW": status_counts.get("Rejected", 0),
        },
        "fraud_alerts": fraud_alerts,
    }


@router.get("")
def list_sahayaks(mandal_id: str | None = Query(None)):
    """Return all sahayaks, optionally filtered by mandal."""
    sahayaks = load_sahayaks()
    if mandal_id:
        sahayaks = [s for s in sahayaks if s.get("mandal_id") == mandal_id]
    return ok(sahayaks)


@router.get("/{sahayak_id}/applications")
def sahayak_applications(
    sahayak_id: str,
    status: str | None = Query(None),
    component: str | None = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
):
    """Return applications assigned to a specific sahayak."""
    sahayak = find_sahayak_by_id(sahayak_id)
    if not sahayak:
        raise HTTPException(status_code=404, detail="Sahayak not found")

    apps = get_applications_by_sahayak(sahayak_id)

    if status:
        apps = [a for a in apps if a.get("status", "").lower() == status.lower()]
    if component:
        apps = [a for a in apps if component.lower() in a.get("component", "").lower()]

    total = len(apps)
    return ok({
        "sahayak": sahayak,
        "total": total,
        "offset": offset,
        "limit": limit,
        "results": apps[offset: offset + limit],
    })


@router.get("/{sahayak_id}/summary")
def sahayak_summary(sahayak_id: str):
    """Dashboard summary stats for a sahayak."""
    sahayak = find_sahayak_by_id(sahayak_id)
    if not sahayak:
        raise HTTPException(status_code=404, detail="Sahayak not found")
    summary = _build_sahayak_summary(sahayak_id)
    return ok({"sahayak": sahayak, **summary})
