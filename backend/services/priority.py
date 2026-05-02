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

PRIORITY_ORDER = {"HIGH": 1, "MEDIUM": 2, "NORMAL": 3, "LOW": 4}

def enrich_with_priority(applications: list[dict]) -> list[dict]:
    result = []
    for app in applications:
        enriched = dict(app)
        enriched["priority"] = get_priority(app)
        result.append(enriched)
    result.sort(key=lambda a: PRIORITY_ORDER.get(a["priority"], 5))
    return result
