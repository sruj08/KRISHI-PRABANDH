from datetime import timedelta
from typing import Any, Optional
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

from config.settings import get_settings
from db.repositories.user_repository import UserRepository
from schemas.auth import JwtUserClaims, LoginRequest
from services.audit_service import AuditService
from utils.helpers import utcnow

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self) -> None:
        self._users = UserRepository()
        self._audit = AuditService()

    def login(self, body: LoginRequest) -> dict[str, Any]:
        user = self._users.get_by_email(body.email.lower().strip())
        if not user:
            raise ValueError("Invalid credentials")
        hashed = user.get("password_hash")
        if not hashed or not _pwd.verify(body.password, hashed):
            raise ValueError("Invalid credentials")

        uid = str(user["id"])
        claims = JwtUserClaims(
            sub=uid,
            role=user.get("role", ""),
            email=user.get("email"),
            state_id=_uuid_or_none(user.get("state_id")),
            division_id=_uuid_or_none(user.get("division_id")),
            district_id=_uuid_or_none(user.get("district_id")),
            taluka_id=_uuid_or_none(user.get("taluka_id")),
            circle_id=_uuid_or_none(user.get("circle_id")),
            village_id=_uuid_or_none(user.get("village_id")),
        )
        token = _encode_jwt(claims)
        self._audit.log(
            actor_id=UUID(uid),
            action="LOGIN",
            entity_type="user",
            entity_id=uid,
        )
        return {"access_token": token, "token_type": "bearer", "user": _public_user(user)}

    def decode_token(self, token: str) -> JwtUserClaims:
        s = get_settings()
        try:
            payload = jwt.decode(token, s.jwt_secret, algorithms=[s.jwt_algorithm])
            return JwtUserClaims.model_validate(payload)
        except JWTError as e:
            raise ValueError("Invalid token") from e


def _uuid_or_none(v: Any) -> Optional[str]:
    if v is None:
        return None
    return str(v)


def _encode_jwt(claims: JwtUserClaims) -> str:
    s = get_settings()
    expire = utcnow() + timedelta(minutes=s.jwt_exp_minutes)
    to_encode = claims.model_dump(exclude_none=True)
    to_encode["exp"] = int(expire.timestamp())
    return jwt.encode(to_encode, s.jwt_secret, algorithm=s.jwt_algorithm)


def _public_user(row: dict[str, Any]) -> dict[str, Any]:
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
