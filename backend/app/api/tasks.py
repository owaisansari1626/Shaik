from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Any, List

from app.db.database import get_db
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, Task as TaskSchema
from app.core.dependencies import get_current_user
from app.core.responses import SuccessResponse

from app.services.task_service import TaskService

router = APIRouter()

@router.post("", response_model=SuccessResponse[TaskSchema])
async def create_task(
    task_in: TaskCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    task = await TaskService.create_task(db, task_in, current_user.id)
    return SuccessResponse(data=task, message="Task created")

@router.get("", response_model=SuccessResponse[List[TaskSchema]])
async def read_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    tasks = await TaskService.get_tasks(db, current_user.id)
    return SuccessResponse(data=tasks, message="Tasks retrieved")

@router.get("/{id}", response_model=SuccessResponse[TaskSchema])
async def read_task(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    task = await TaskService.get_task(db, id, current_user.id)
    return SuccessResponse(data=task, message="Task retrieved")

@router.patch("/{id}", response_model=SuccessResponse[TaskSchema])
async def update_task(
    id: int,
    task_in: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    task = await TaskService.update_task(db, id, task_in, current_user.id)
    return SuccessResponse(data=task, message="Task updated")

@router.delete("/{id}", response_model=SuccessResponse)
async def delete_task(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    await TaskService.delete_task(db, id, current_user.id)
    return SuccessResponse(message="Task deleted")
