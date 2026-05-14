from typing import Any, Optional

import db.json_store as store


class FarmRepository:
    def get_by_id(self, farm_id: str) -> Optional[dict[str, Any]]:
        return store.find_one("farms", id=farm_id)

    def list_by_farmer(self, farmer_profile_id: str) -> list[dict[str, Any]]:
        return store.find_many("farms", farmer_id=farmer_profile_id)
