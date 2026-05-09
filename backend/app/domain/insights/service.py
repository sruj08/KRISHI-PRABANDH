from app.domain.applications.repository import ApplicationRepository

PRIORITY_ORDER = {"HIGH": 1, "MEDIUM": 2, "NORMAL": 3, "LOW": 4}

class InsightsService:
    @staticmethod
    def get_priority(application: dict) -> str:
        status = (application.get("status") or "").strip()
        remarks = (application.get("remarks") or "").strip()
        if status == "Under Scrutiny" and "Field" in remarks:
            return "HIGH"
        if status == "Applied":
            return "MEDIUM"
        if status == "Rejected":
            return "LOW"
        return "NORMAL"

    @staticmethod
    def enrich_with_priority(applications: list[dict]) -> list[dict]:
        result = []
        for app in applications:
            enriched = dict(app)
            enriched["priority"] = InsightsService.get_priority(app)
            result.append(enriched)
        result.sort(key=lambda a: PRIORITY_ORDER.get(a["priority"], 5))
        return result

    @staticmethod
    def get_eligible_farmers(limit: int = 10) -> list[dict]:
        apps = ApplicationRepository.get_all(limit=10000)
        eligible_statuses = {"Applied", "Under Scrutiny"}
        seen = set()
        result = []
        for app in apps:
            if app.get("status") in eligible_statuses:
                fid = app.get("farmer_id")
                if fid and fid not in seen:
                    seen.add(fid)
                    result.append({
                        "farmer_id": fid,
                        "component": app.get("component", ""),
                        "scheme_name": app.get("scheme_name", ""),
                        "scheme_category": app.get("scheme_category", ""),
                        "status": app.get("status", ""),
                        "remarks": app.get("remarks") or "No remarks",
                        "application_id": app.get("application_id", ""),
                    })
            if len(result) >= limit:
                break
        return result

    @staticmethod
    def get_fraud_cases() -> list[dict]:
        apps = ApplicationRepository.get_all(limit=10000)
        result = []
        for app in apps:
            rejection = (app.get("rejection_reason") or "").lower()
            if "duplicate" in rejection:
                result.append({
                    "application_id": app.get("application_id", ""),
                    "farmer_id": app.get("farmer_id", ""),
                    "component": app.get("component", ""),
                    "scheme_name": app.get("scheme_name", ""),
                    "scheme_category": app.get("scheme_category", ""),
                    "status": app.get("status", ""),
                    "rejection_reason": app.get("rejection_reason", ""),
                    "explanation": "Possible duplicate application detected. Requires investigation.",
                })
        return result

    @staticmethod
    def get_summary() -> dict:
        apps = ApplicationRepository.get_all(limit=10000)
        enriched = InsightsService.enrich_with_priority(apps)
        return {
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
            "fraud_alerts": len(InsightsService.get_fraud_cases()),
        }
