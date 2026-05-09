from fastapi import APIRouter
from app.domain.logs.schemas import AuditLog
from datetime import datetime

router = APIRouter(prefix="/logs", tags=["Audit Logs"])

_audit_log: list[dict] = []

def append_log(action: str, application_id: str, officer_id: str = "system", details: str = ""):
    _audit_log.append({
        "action": action,
        "application_id": application_id,
        "officer_id": officer_id,
        "details": details,
        "timestamp": datetime.utcnow().isoformat(),
    })

@router.get("")
def get_logs(limit: int = 100):
    return {"success": True, "data": {"total": len(_audit_log), "results": _audit_log[-limit:][::-1]}}

@router.post("")
def add_log(entry: AuditLog):
    _audit_log.append({
        "action": entry.action,
        "application_id": entry.application_id,
        "officer_id": entry.officer_id or "system",
        "details": entry.details or "",
        "timestamp": entry.timestamp.isoformat(),
    })
    return {"success": True, "data": "Log recorded"}

@router.delete("")
def clear_logs():
    _audit_log.clear()
    return {"success": True, "data": "All logs cleared"}
