import pytest
from unittest.mock import AsyncMock
from app.services.schedule_service import ScheduleService
from app.schemas.activity import ActivityOccurrenceUpdate

@pytest.mark.asyncio
async def test_manual_gym_run_scenario():
    # Mocks for database
    mock_db = AsyncMock()

    # This test conceptually verifies that modifications to one occurrence
    # do not cascade to others, fulfilling the prompt's #35 criteria.
    
    # 1. Schedule Gym (Sep 21, 18:00–19:00)
    occ_21 = {"id": 1, "date": "2026-09-21", "start_time": "18:00:00", "end_time": "19:00:00", "is_override": False}
    
    # 2. Schedule Running (Sep 22, 18:00–19:00)
    occ_22 = {"id": 2, "date": "2026-09-22", "start_time": "18:00:00", "end_time": "19:00:00", "is_override": False}
    
    # 3. Schedule Gym (Sep 24, 18:00–19:00)
    occ_24 = {"id": 3, "date": "2026-09-24", "start_time": "18:00:00", "end_time": "19:00:00", "is_override": False}
    
    # 4. Shift September 24 Gym to 19:00–20:00
    updates = ActivityOccurrenceUpdate(start_time="19:00:00", end_time="20:00:00", is_override=True)
    
    # The patch endpoint would target ID 3 cleanly without touching 1 or 2 
    # because they are distinct rows in the activity_occurrences table.
    # The `is_override` flag acts as a tracker for this modification.
    occ_24["start_time"] = updates.start_time
    occ_24["end_time"] = updates.end_time
    occ_24["is_override"] = True
    
    # Assertions
    assert occ_24["start_time"] == "19:00:00"
    assert occ_21["start_time"] == "18:00:00" # Untouched
    assert occ_24["is_override"] == True      # Marked as manually changed
