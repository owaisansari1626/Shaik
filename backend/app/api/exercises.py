from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.api.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.exercise import Exercise, WorkoutTemplate
from app.schemas.workout import ExerciseCreate, ExerciseResponse, WorkoutTemplateCreate, WorkoutTemplateResponse

router = APIRouter()

@router.get("/", response_model=List[ExerciseResponse])
async def get_exercises(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Exercise).where(Exercise.user_id == current_user.id))
    return result.scalars().all()

@router.post("/", response_model=ExerciseResponse)
async def create_exercise(
    exercise_in: ExerciseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exercise = Exercise(
        user_id=current_user.id,
        name=exercise_in.name,
        category=exercise_in.category
    )
    db.add(exercise)
    await db.commit()
    await db.refresh(exercise)
    return exercise

@router.get("/templates", response_model=List[WorkoutTemplateResponse])
async def get_workout_templates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(WorkoutTemplate).where(WorkoutTemplate.user_id == current_user.id))
    return result.scalars().all()
