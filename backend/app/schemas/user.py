from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    name: str
    timezone: Optional[str] = "UTC"
    week_start: Optional[int] = 0
    time_format: Optional[str] = "24h"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    timezone: Optional[str] = None
    week_start: Optional[int] = None
    time_format: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
