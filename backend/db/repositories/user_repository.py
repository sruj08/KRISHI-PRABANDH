from typing import Any, Optional

import db.json_store as store


class UserRepository:
    def get_by_email(self, email: str) -> Optional[dict[str, Any]]:
        return store.find_one("users", email=email)

    def get_by_id(self, user_id: str) -> Optional[dict[str, Any]]:
        return store.find_one("users", id=user_id)
