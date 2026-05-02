def get_eligible_farmers(applications: list[dict], limit: int = 10) -> list[dict]:
    eligible_statuses = {"Applied", "Under Scrutiny"}
    seen = set()
    result = []
    for app in applications:
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
