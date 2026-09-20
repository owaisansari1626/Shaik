from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from datetime import datetime
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate

class TaskService:
    @staticmethod
    async def create_task(db: AsyncSession, task_in: TaskCreate, user_id: int) -> Task:
        data = task_in.dict()
        data["user_id"] = user_id
        task = Task(**data)  # type: ignore
        db.add(task)
        await db.commit()
        await db.refresh(task)
        return task

    @staticmethod
    async def get_tasks(db: AsyncSession, user_id: int) -> list[Task]:
        # Include joined relationships like Category if needed later.
        result = await db.execute(select(Task).filter(Task.user_id == user_id))
        return result.scalars().all()

    @staticmethod
    async def get_task(db: AsyncSession, task_id: int, user_id: int) -> Task:
        result = await db.execute(select(Task).filter(Task.id == task_id, Task.user_id == user_id))
        task = result.scalars().first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    @staticmethod
    async def update_task(db: AsyncSession, task_id: int, task_in: TaskUpdate, user_id: int) -> Task:
        task = await TaskService.get_task(db, task_id, user_id)
        
        update_data = task_in.dict(exclude_unset=True)
        
        # Handle custom logic for completion
        if 'status' in update_data:
            if update_data['status'] == 'COMPLETED' and task.status != 'COMPLETED':
                task.completed_at = datetime.utcnow()
            elif update_data['status'] != 'COMPLETED' and task.status == 'COMPLETED':
                task.completed_at = None

        for field, value in update_data.items():
            setattr(task, field, value)
            
        await db.commit()
        await db.refresh(task)
        return task

    @staticmethod
    async def delete_task(db: AsyncSession, task_id: int, user_id: int):
        task = await TaskService.get_task(db, task_id, user_id)
        await db.delete(task)
        await db.commit()
