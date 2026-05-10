from typing import Any, Optional

from db.repositories.user_repository import UserRepository


class UserService:
    def __init__(self) -> None:
        self._repo = UserRepository()

    def public_profile(self, user_id: str) -> Optional[dict[str, Any]]:
        row = self._repo.get_by_id(user_id)
        if not row:
            return None
        return {
            "id": str(row["id"]),
            "email": row.get("email"),
            "role": row.get("role"),
            "state_id": row.get("state_id"),
            "division_id": row.get("division_id"),
            "district_id": row.get("district_id"),
            "taluka_id": row.get("taluka_id"),
            "circle_id": row.get("circle_id"),
            "village_id": row.get("village_id"),
        }
