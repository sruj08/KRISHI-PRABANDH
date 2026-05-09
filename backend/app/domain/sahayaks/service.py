from fastapi import HTTPException
from app.domain.sahayaks.repository import SahayakRepository
from app.domain.applications.repository import ApplicationRepository

class SahayakService:
    
    @staticmethod
    def build_summary(sahayak_id: str) -> dict:
        sahayak = SahayakRepository.get_by_id(sahayak_id)
        if not sahayak:
            raise HTTPException(status_code=404, detail="Sahayak not found")
            
        apps = ApplicationRepository.get_all(sahayak_id=sahayak_id, limit=10000)

        status_counts: dict[str, int] = {}
        for a in apps:
            s = a.get("status", "Unknown")
            status_counts[s] = status_counts.get(s, 0) + 1

        high_priority = sum(
            1 for a in apps
            if a.get("status") == "Under Scrutiny" and "Field" in (a.get("remarks") or "")
        )
        fraud_alerts = sum(
            1 for a in apps
            if "duplicate" in (a.get("rejection_reason") or "").lower()
        )

        return {
            "sahayak": sahayak,
            "total_applications": len(apps),
            "by_status": status_counts,
            "by_priority": {
                "HIGH": high_priority,
                "MEDIUM": status_counts.get("Applied", 0),
                "NORMAL": status_counts.get("Approved", 0),
                "LOW": status_counts.get("Rejected", 0),
            },
            "fraud_alerts": fraud_alerts,
        }
