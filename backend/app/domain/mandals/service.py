from fastapi import HTTPException
from app.domain.mandals.repository import MandalRepository
from app.domain.applications.repository import ApplicationRepository
from app.domain.sahayaks.repository import SahayakRepository

class MandalService:
    
    @staticmethod
    def build_summary(mandal_id: str) -> dict:
        mandal = MandalRepository.get_by_id(mandal_id)
        if not mandal:
            raise HTTPException(status_code=404, detail="Mandal not found")
            
        apps = ApplicationRepository.get_all(mandal_id=mandal_id, limit=10000)
        sahayaks = SahayakRepository.get_by_mandal(mandal_id)

        status_counts: dict[str, int] = {}
        for a in apps:
            s = a.get("status", "Unknown")
            status_counts[s] = status_counts.get(s, 0) + 1

        # Per-sahayak breakdown
        sahayak_breakdown = []
        for s in sahayaks:
            sid = s["sahayak_id"]
            s_apps = [a for a in apps if a.get("sahayak_id") == sid]
            pending = sum(1 for a in s_apps if a.get("status") in ("Applied", "Under Scrutiny"))
            approved = sum(1 for a in s_apps if a.get("status") == "Approved")
            high_priority = sum(
                1 for a in s_apps
                if a.get("status") == "Under Scrutiny" and "Field" in (a.get("remarks") or "")
            )
            sahayak_breakdown.append({
                "sahayak_id": sid,
                "name": s.get("name"),
                "total": len(s_apps),
                "pending": pending,
                "approved": approved,
                "high_priority": high_priority,
            })

        fraud_alerts = sum(
            1 for a in apps
            if "duplicate" in (a.get("rejection_reason") or "").lower()
        )
        high_priority_total = sum(
            1 for a in apps
            if a.get("status") == "Under Scrutiny" and "Field" in (a.get("remarks") or "")
        )

        return {
            "mandal": mandal,
            "total_applications": len(apps),
            "by_status": status_counts,
            "fraud_alerts": fraud_alerts,
            "high_priority": high_priority_total,
            "sahayak_count": len(sahayaks),
            "sahayak_breakdown": sahayak_breakdown,
        }
