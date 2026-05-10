from fastapi import APIRouter, Depends

from middleware.auth import get_current_user
from schemas.auth import JwtUserClaims
from services.user_service import UserService
from utils.response import failure, success

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
def me(user: JwtUserClaims = Depends(get_current_user)):
    prof = UserService().public_profile(user.sub)
    if not prof:
        return failure("User not found", status_code=404)
    return success("Profile", prof)
