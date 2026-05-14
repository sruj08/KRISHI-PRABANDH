from typing import Any, Optional

import db.json_store as store


class FarmerRepository:
    def get_by_id(self, farmer_id: str) -> Optional[dict[str, Any]]:
        return store.find_one("farmer_profiles", id=farmer_id)

    def get_by_user_id(self, user_id: str) -> Optional[dict[str, Any]]:
        return store.find_one("farmer_profiles", user_id=user_id)

    def get_by_email(self, email: str) -> Optional[dict[str, Any]]:
        return store.find_one("farmer_profiles", email=email)
