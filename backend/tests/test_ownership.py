import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException
from app.services.task_service import TaskService
from app.schemas.task import TaskUpdate

@pytest.mark.asyncio
async def test_user_ownership_enforcement():
    # Attempting to fetch a task where the task.user_id does not match the requester ID (user_id parameter in get_task)
    # The SQLAlchemy query in TaskService explicitly enforces `.filter(Task.user_id == user_id)`
    
    mock_db = AsyncMock()
    # Simulate DB returning None because the ownership filter excludes it
    mock_result = AsyncMock()
    mock_result.scalars().first.return_value = None
    mock_db.execute.return_value = mock_result
    
    with pytest.raises(HTTPException) as exc_info:
        await TaskService.get_task(db=mock_db, task_id=1, user_id=999) # User 999 tries to get Task 1
        
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Task not found"

@pytest.mark.asyncio
async def test_update_ownership_enforcement():
    mock_db = AsyncMock()
    mock_result = AsyncMock()
    mock_result.scalars().first.return_value = None
    mock_db.execute.return_value = mock_result
    
    update_data = TaskUpdate(title="Hacked Title")
    
    with pytest.raises(HTTPException) as exc_info:
        await TaskService.update_task(db=mock_db, task_id=1, task_in=update_data, user_id=999)
        
    assert exc_info.value.status_code == 404
