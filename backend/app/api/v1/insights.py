from fastapi import APIRouter, Query
from app.domain.applications.repository import ApplicationRepository
from app.domain.insights.service import InsightsService

router = APIRouter(prefix="/insights", tags=["Insights"])

def ok(data):
    return {"success": True, "data": data}

@router.get("/priority")
def get_priority_list(limit: int = Query(50, le=500)):
    apps = ApplicationRepository.get_all(limit=limit)
    enriched = InsightsService.enrich_with_priority(apps)
    return ok({"total": len(enriched), "results": enriched[:limit]})

@router.get("/priority/high")
def get_high_priority():
    apps = ApplicationRepository.get_all(limit=10000)
    enriched = InsightsService.enrich_with_priority(apps)
    high = [a for a in enriched if a["priority"] == "HIGH"]
    return ok({"total": len(high), "results": high})

@router.get("/eligible-farmers")
def eligible_farmers(limit: int = Query(10, le=50)):
    farmers = InsightsService.get_eligible_farmers(limit=limit)
    return ok({"total": len(farmers), "results": farmers})

@router.get("/fraud-alerts")
def fraud_alerts():
    cases = InsightsService.get_fraud_cases()
    return ok({"total": len(cases), "results": cases})

@router.get("/summary")
def summary():
    return ok(InsightsService.get_summary())
