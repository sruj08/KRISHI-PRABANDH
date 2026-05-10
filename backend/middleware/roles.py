from collections.abc import Callable
from typing import TypeVar

from fastapi import Depends, HTTPException

from config.constants import ALL_ROLES
from middleware.auth import get_current_user
from schemas.auth import JwtUserClaims

T = TypeVar("T")


def require_roles(*allowed: str) -> Callable[..., JwtUserClaims]:
    allowed_set = frozenset(allowed)

    async def _inner(user: JwtUserClaims = Depends(get_current_user)) -> JwtUserClaims:
        if user.role not in allowed_set:
            raise HTTPException(status_code=403, detail="Insufficient permissions for this operation")
        if user.role not in ALL_ROLES:
            raise HTTPException(status_code=403, detail="Unknown role")
        return user

    return _inner
