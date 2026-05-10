from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from middleware.auth import get_current_user_optional
from schemas.auth import JwtUserClaims, LoginRequest
from services.audit_service import AuditService
from services.auth_service import AuthService
from utils.response import failure, success

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(body: LoginRequest):
    try:
        data = AuthService().login(body)
        return success("Authenticated", data)
    except ValueError as e:
        return failure(str(e), status_code=401)


@router.post("/logout")
def logout(user: JwtUserClaims | None = Depends(get_current_user_optional)):
    if user:
        AuditService().log(
            actor_id=UUID(user.sub),
            action="LOGOUT",
            entity_type="session",
        )
    return success("Logout recorded; discard client token", None)
