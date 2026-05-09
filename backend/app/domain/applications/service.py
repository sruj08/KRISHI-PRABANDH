from fastapi import HTTPException
from app.domain.applications.repository import ApplicationRepository

ALLOWED_TRANSITIONS: dict[str, list[str]] = {
    "Applied": ["Under Scrutiny"],
    "Under Scrutiny": ["Approved", "Rejected"],
}

class ApplicationService:
    
    @staticmethod
    def get_allowed_transitions(current_status: str) -> list[str]:
        return ALLOWED_TRANSITIONS.get(current_status, [])
        
    @staticmethod
    def update_status(application_id: str, new_status: str, remarks: str | None = None) -> dict:
        app = ApplicationRepository.get_by_id(application_id)
        if not app:
            raise HTTPException(status_code=404, detail=f"Application '{application_id}' not found.")
        
        current = app.get("status", "")
        allowed = ApplicationService.get_allowed_transitions(current)
        
        if new_status not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Transition from '{current}' to '{new_status}' is not allowed. Allowed: {allowed}",
            )
        
        update_data = {"status": new_status}
        if remarks:
            update_data["remarks"] = remarks
            
        updated_app = ApplicationRepository.update(application_id, update_data)
        return updated_app if updated_app else app

    @staticmethod
    def update_photo(application_id: str, data_uri: str, filename: str, timestamp: str, remarks: str | None = None) -> dict:
        app = ApplicationRepository.get_by_id(application_id)
        if not app:
            raise HTTPException(status_code=404, detail=f"Application '{application_id}' not found.")

        new_remarks = remarks or "Photo uploaded for verification"
        existing = app.get("remarks", "")
        updated_remarks = f"{existing}; {new_remarks}".lstrip("; ")
        
        update_data = {
            "photo": data_uri,
            "photo_filename": filename,
            "photo_uploaded_at": timestamp,
            "remarks": updated_remarks
        }
        
        ApplicationRepository.update(application_id, update_data)
        return {"application_id": application_id, "filename": filename}
