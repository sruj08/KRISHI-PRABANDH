from typing import Any, Optional

import db.json_store as store


class AnalyticsRepository:
    def weather(self, district_id: Optional[str] = None, limit: int = 100) -> list[dict[str, Any]]:
        if district_id:
            rows = store.find_many("weather_analytics", district_id=district_id)
        else:
            rows = store.load("weather_analytics")
        rows = sorted(rows, key=lambda r: r.get("recorded_at", ""), reverse=True)
        return rows[:limit]

    def satellite(self, district_id: Optional[str] = None, limit: int = 100) -> list[dict[str, Any]]:
        if district_id:
            rows = store.find_many("satellite_analytics", district_id=district_id)
        else:
            rows = store.load("satellite_analytics")
        rows = sorted(rows, key=lambda r: r.get("recorded_at", ""), reverse=True)
        return rows[:limit]
