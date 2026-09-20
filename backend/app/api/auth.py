from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Any

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, User as UserSchema
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.core.responses import SuccessResponse

router = APIRouter()

@router.post("/register", response_model=SuccessResponse[UserSchema])
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)) -> Any:
    result = await db.execute(select(User).filter(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
        
    user = User(
        email=user_in.email,
        name=user_in.name,
        password_hash=get_password_hash(user_in.password),
        timezone=user_in.timezone,
        week_start=user_in.week_start,
        time_format=user_in.time_format
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return SuccessResponse(data=user, message="User registered successfully")

@router.post("/login", response_model=SuccessResponse[dict])
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(User).filter(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
        
    token = create_access_token(subject=user.id)
    return SuccessResponse(data={"access_token": token, "token_type": "bearer"}, message="Login successful")

@router.get("/me", response_model=SuccessResponse[UserSchema])
async def read_users_me(
    current_user: User = Depends(get_current_user)
) -> Any:
    return SuccessResponse(data=current_user, message="User retrieved")
