from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.api.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.workout import WorkoutSession
from app.schemas.workout import WorkoutSessionCreate, WorkoutSessionResponse, WorkoutSessionUpdate

router = APIRouter()

@router.post("/", response_model=WorkoutSessionResponse)
async def create_workout_session(
    workout_in: WorkoutSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = WorkoutSession(
        user_id=current_user.id,
        activity_occurrence_id=workout_in.activity_occurrence_id,
        workout_type=workout_in.workout_type,
        date=workout_in.date,
        start_time=workout_in.start_time,
        end_time=workout_in.end_time,
        duration_minutes=workout_in.duration_minutes,
        distance_km=workout_in.distance_km,
        pace=workout_in.pace,
        calories=workout_in.calories,
        notes=workout_in.notes,
        status=workout_in.status
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("/", response_model=List[WorkoutSessionResponse])
async def get_workout_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(WorkoutSession).where(WorkoutSession.user_id == current_user.id))
    return result.scalars().all()
