from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class JwtUserClaims(BaseModel):
    model_config = ConfigDict(extra="ignore")

    sub: str
    role: str
    email: str | None = None
    state_id: str | None = None
    division_id: str | None = None
    district_id: str | None = None
    taluka_id: str | None = None
    circle_id: str | None = None
    village_id: str | None = None
