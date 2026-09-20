from pydantic import BaseModel
from datetime import datetime, date, time
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "MEDIUM"
    status: Optional[str] = "PENDING"
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    estimated_minutes: Optional[int] = None
    actual_minutes: Optional[int] = None
    category_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    category_id: Optional[int] = None
    estimated_minutes: Optional[int] = None
    actual_minutes: Optional[int] = None

class Task(TaskBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
