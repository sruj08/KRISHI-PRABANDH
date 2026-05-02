from fastapi import HTTPException
from utils.loader import load_applications, save_applications

ALLOWED_TRANSITIONS: dict[str, list[str]] = {
    "Applied": ["Under Scrutiny"],
    "Under Scrutiny": ["Approved", "Rejected"],
}

def update_status(application_id: str, new_status: str, remarks: str | None = None) -> dict:
    apps = load_applications()
    for app in apps:
        if app.get("application_id") == application_id:
            current = app.get("status", "")
            allowed = ALLOWED_TRANSITIONS.get(current, [])
            if new_status not in allowed:
                raise HTTPException(
                    status_code=400,
                    detail=f"Transition from '{current}' to '{new_status}' is not allowed. Allowed: {allowed}",
                )
            app["status"] = new_status
            if remarks:
                app["remarks"] = remarks
            save_applications(apps)
            return app
    raise HTTPException(status_code=404, detail=f"Application '{application_id}' not found.")

def get_allowed_transitions(current_status: str) -> list[str]:
    return ALLOWED_TRANSITIONS.get(current_status, [])
