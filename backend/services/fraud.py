def get_fraud_cases(applications: list[dict]) -> list[dict]:
    result = []
    for app in applications:
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
