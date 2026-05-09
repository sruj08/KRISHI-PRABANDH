from typing import Any
from app.domain.vistar.repository import VistarRepository
from app.domain.sahayaks.repository import SahayakRepository

FRAUD_THRESHOLD = 0.30
MODERATE_THRESHOLD = 0.65

class VistarService:
    
    @staticmethod
    def calculate_attendance_gap(session: dict) -> dict:
        reported = session.get("reported_attendance", 0) or 0
        digital  = session.get("digital_attendance",  0) or 0

        if reported == 0:
            gap_pct = 0.0
            ratio   = 1.0
        else:
            gap_pct = round(((reported - digital) / reported) * 100, 1)
            ratio   = digital / reported

        if ratio < FRAUD_THRESHOLD:
            risk = "HIGH"
        elif ratio < MODERATE_THRESHOLD:
            risk = "MODERATE"
        else:
            risk = "CLEAN"

        return {
            "reported_attendance": reported,
            "digital_attendance": digital,
            "gap": reported - digital,
            "gap_pct": gap_pct,
            "ratio": round(ratio, 2),
            "risk": risk,
        }

    @staticmethod
    def get_enriched_sessions(mandal_id: str | None = None) -> list[dict]:
        sessions = VistarRepository.get_all(mandal_id=mandal_id)
        sahayaks = SahayakRepository.get_all()
        names = {s["sahayak_id"]: s.get("name") for s in sahayaks}
        
        enriched = []
        for s in sessions:
            gap = VistarService.calculate_attendance_gap(s)
            enriched.append({
                **s,
                "sahayak_name": names.get(s.get("sahayak_id", ""), "Unknown"),
                **gap,
            })
        return enriched

    @staticmethod
    def detect_fraud_sessions(mandal_id: str | None = None) -> list[dict]:
        sessions = VistarService.get_enriched_sessions(mandal_id)
        return [s for s in sessions if s["risk"] in ("HIGH", "MODERATE")]

    @staticmethod
    def compute_sahayak_performance(mandal_id: str | None) -> list[dict]:
        sessions = VistarService.get_enriched_sessions(mandal_id)
        perf: dict[str, Any] = {}

        for s in sessions:
            sid = s["sahayak_id"]
            if sid not in perf:
                perf[sid] = {
                    "sahayak_id": sid,
                    "sahayak_name": s["sahayak_name"],
                    "total_sessions": 0,
                    "total_reported": 0,
                    "total_digital": 0,
                    "fraud_flags": 0,
                    "moderate_flags": 0,
                }
            perf[sid]["total_sessions"] += 1
            perf[sid]["total_reported"] += s["reported_attendance"]
            perf[sid]["total_digital"]  += s["digital_attendance"]
            if s["risk"] == "HIGH":
                perf[sid]["fraud_flags"] += 1
            elif s["risk"] == "MODERATE":
                perf[sid]["moderate_flags"] += 1

        result = []
        for sid, p in perf.items():
            rep = p["total_reported"] or 1
            avg_reported = round(p["total_reported"] / p["total_sessions"], 1)
            avg_digital  = round(p["total_digital"]  / p["total_sessions"], 1)
            overall_ratio = round(p["total_digital"] / rep, 2)
            result.append({
                **p,
                "avg_reported_attendance": avg_reported,
                "avg_digital_attendance":  avg_digital,
                "overall_compliance_ratio": overall_ratio,
                "overall_risk": (
                    "HIGH"     if overall_ratio < FRAUD_THRESHOLD else
                    "MODERATE" if overall_ratio < MODERATE_THRESHOLD else
                    "CLEAN"
                ),
            })

        return sorted(result, key=lambda x: x["overall_compliance_ratio"])

    @staticmethod
    def compute_mandal_analytics(mandal_id: str) -> dict:
        sessions  = VistarService.get_enriched_sessions(mandal_id)
        perf      = VistarService.compute_sahayak_performance(mandal_id)
        fraud_ses = [s for s in sessions if s["risk"] in ("HIGH", "MODERATE")]

        total_sessions   = len(sessions)
        total_reported   = sum(s["reported_attendance"] for s in sessions)
        total_digital    = sum(s["digital_attendance"]  for s in sessions)
        avg_reported     = round(total_reported / total_sessions, 1) if total_sessions else 0
        avg_digital      = round(total_digital  / total_sessions, 1) if total_sessions else 0
        overall_gap_pct  = round(((total_reported - total_digital) / total_reported) * 100, 1) if total_reported else 0

        high_risk_count  = sum(1 for s in sessions if s["risk"] == "HIGH")
        mod_risk_count   = sum(1 for s in sessions if s["risk"] == "MODERATE")

        suspicious_sahayak = perf[0] if perf else None
        top_sahayak        = perf[-1] if perf else None

        insights = []
        if high_risk_count > 0:
            names = list({s["sahayak_name"] for s in sessions if s["risk"] == "HIGH"})
            insights.append(f"⚠️ High attendance fraud risk in {high_risk_count} session(s) — {', '.join(names)}")
        if suspicious_sahayak and suspicious_sahayak["overall_risk"] in ("HIGH", "MODERATE"):
            insights.append(
                f"🔴 {suspicious_sahayak['sahayak_name']} shows consistent over-reporting "
                f"(compliance ratio: {int(suspicious_sahayak['overall_compliance_ratio'] * 100)}%)"
            )
        if top_sahayak and top_sahayak["overall_risk"] == "CLEAN":
            insights.append(f"✅ {top_sahayak['sahayak_name']} has excellent digital attendance compliance.")
        if overall_gap_pct > 40:
            insights.append(f"📉 Overall attendance gap of {overall_gap_pct}% detected across the mandal — systematic audit recommended.")

        return {
            "total_sessions":       total_sessions,
            "avg_reported_attendance": avg_reported,
            "avg_digital_attendance":  avg_digital,
            "overall_gap_pct":      overall_gap_pct,
            "high_risk_sessions":   high_risk_count,
            "moderate_risk_sessions": mod_risk_count,
            "fraud_flagged_count":  high_risk_count + mod_risk_count,
            "sahayak_performance":  perf,
            "fraud_sessions":       fraud_ses,
            "insights":             insights,
        }
