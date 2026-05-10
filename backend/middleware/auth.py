from typing import Optional

from fastapi import Header, HTTPException

from schemas.auth import JwtUserClaims
from services.auth_service import AuthService


async def get_current_user(authorization: str | None = Header(None)) -> JwtUserClaims:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1].strip()
    try:
        return AuthService().decode_token(token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e


async def get_current_user_optional(authorization: str | None = Header(None)) -> Optional[JwtUserClaims]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    try:
        return AuthService().decode_token(token)
    except ValueError:
        return None
