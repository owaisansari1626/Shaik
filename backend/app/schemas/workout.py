from pydantic import BaseModel
from typing import List, Optional
from datetime import date, time, datetime
from app.models.workout import WorkoutType

# Workout Set
class WorkoutSetBase(BaseModel):
    set_number: int
    reps: Optional[int] = None
    weight: Optional[float] = None
    duration: Optional[int] = None
    rest_seconds: Optional[int] = None
    completed: bool = False

class WorkoutSetCreate(WorkoutSetBase):
    pass

class WorkoutSetUpdate(WorkoutSetBase):
    id: int
    set_number: Optional[int] = None

class WorkoutSetResponse(WorkoutSetBase):
    id: int
    workout_exercise_id: int
    
    class Config:
        from_attributes = True

# Workout Exercise
class WorkoutExerciseBase(BaseModel):
    exercise_name: str
    exercise_order: int = 0
    notes: Optional[str] = None

class WorkoutExerciseCreate(WorkoutExerciseBase):
    sets: Optional[List[WorkoutSetCreate]] = []

class WorkoutExerciseUpdate(WorkoutExerciseBase):
    exercise_name: Optional[str] = None
    sets: Optional[List[WorkoutSetUpdate]] = None

class WorkoutExerciseResponse(WorkoutExerciseBase):
    id: int
    workout_session_id: int
    sets: List[WorkoutSetResponse] = []
    
    class Config:
        from_attributes = True

# Workout Session
class WorkoutSessionBase(BaseModel):
    activity_occurrence_id: Optional[int] = None
    workout_type: WorkoutType = WorkoutType.GYM
    date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    
    distance_km: Optional[float] = None
    pace: Optional[float] = None
    calories: Optional[int] = None
    
    notes: Optional[str] = None
    status: str = "COMPLETED"

class WorkoutSessionCreate(WorkoutSessionBase):
    exercises: Optional[List[WorkoutExerciseCreate]] = []

class WorkoutSessionUpdate(WorkoutSessionBase):
    date: Optional[date] = None
    workout_type: Optional[WorkoutType] = None
    exercises: Optional[List[WorkoutExerciseCreate]] = None # Simplification, typically we might replace or update directly

class WorkoutSessionResponse(WorkoutSessionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    exercises: List[WorkoutExerciseResponse] = []
    
    class Config:
        from_attributes = True

# Exercise Library
class ExerciseBase(BaseModel):
    name: str
    category: Optional[str] = None

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseResponse(ExerciseBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Templates
class WorkoutTemplateBase(BaseModel):
    name: str
    exercises: list # JSON payload

class WorkoutTemplateCreate(WorkoutTemplateBase):
    pass

class WorkoutTemplateResponse(WorkoutTemplateBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
