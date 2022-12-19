from typing import Optional
from pydantic import BaseModel, EmailStr


class BaseRequest(BaseModel):
    # may define additional fields or config shared across requests
    pass


class RefreshTokenRequest(BaseRequest):
    refresh_token: str


class UserUpdatePasswordRequest(BaseRequest):
    password: str


class UserCreateRequest(BaseRequest):
    email: EmailStr
    password: str


class ItemCondition(BaseRequest):
    search: Optional[str] = ""
    status_filter: Optional[str] = ""
    tag_filter: Optional[str] = ""
    offset: Optional[int] = 0
    sort: Optional[str] = ""
    asc: Optional[bool] = True
