from fastapi import HTTPException
from utils.loader import find_by_id, supabase
ALLOWED_TRANSITIONS: dict[str, list[str]] = {
    "Applied": ["Under Scrutiny"],
    "Under Scrutiny": ["Approved", "Rejected"],
}


def update_status(application_id: str, new_status: str, remarks: str | None = None) -> dict:
    app = find_by_id(application_id)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application '{application_id}' not found.")
    
    current = app.get("status", "")
    allowed = ALLOWED_TRANSITIONS.get(current, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Transition from '{current}' to '{new_status}' is not allowed. Allowed: {allowed}",
        )
    
    update_data = {"status": new_status}
    if remarks:
        update_data["remarks"] = remarks
        
    res = supabase.table("applications").update(update_data).eq("application_id", application_id).execute()
    if res.data:
        return res.data[0]
    return app

def get_allowed_transitions(current_status: str) -> list[str]:
    return ALLOWED_TRANSITIONS.get(current_status, [])
