from fastapi import APIRouter, Query
from utils.loader import load_applications
from services.priority import enrich_with_priority
from services.eligibility import get_eligible_farmers
from services.fraud import get_fraud_cases

router = APIRouter(prefix="/insights", tags=["Insights"])

def ok(data):
    return {"success": True, "data": data}

@router.get("/priority")
def get_priority_list(limit: int = Query(50, le=500)):
    apps = load_applications()
    enriched = enrich_with_priority(apps)
    return ok({"total": len(enriched), "results": enriched[:limit]})

@router.get("/priority/high")
def get_high_priority():
    apps = load_applications()
    enriched = enrich_with_priority(apps)
    high = [a for a in enriched if a["priority"] == "HIGH"]
    return ok({"total": len(high), "results": high})

@router.get("/eligible-farmers")
def eligible_farmers(limit: int = Query(10, le=50)):
    apps = load_applications()
    farmers = get_eligible_farmers(apps, limit=limit)
    return ok({"total": len(farmers), "results": farmers})

@router.get("/fraud-alerts")
def fraud_alerts():
    apps = load_applications()
    cases = get_fraud_cases(apps)
    return ok({"total": len(cases), "results": cases})

@router.get("/summary")
def summary():
    apps = load_applications()
    enriched = enrich_with_priority(apps)
    return ok({
        "total_applications": len(apps),
        "by_status": {
            "Applied": sum(1 for a in apps if a.get("status") == "Applied"),
            "Under Scrutiny": sum(1 for a in apps if a.get("status") == "Under Scrutiny"),
            "Approved": sum(1 for a in apps if a.get("status") == "Approved"),
            "Rejected": sum(1 for a in apps if a.get("status") == "Rejected"),
        },
        "by_priority": {
            "HIGH": sum(1 for a in enriched if a["priority"] == "HIGH"),
            "MEDIUM": sum(1 for a in enriched if a["priority"] == "MEDIUM"),
            "NORMAL": sum(1 for a in enriched if a["priority"] == "NORMAL"),
            "LOW": sum(1 for a in enriched if a["priority"] == "LOW"),
        },
        "fraud_alerts": len(get_fraud_cases(apps)),
    })
