import pytest

# Testing the raw math logic which will be used in the service layer

def calculate_progress(planned, completed, skipped=0):
    if planned == 0:
        return 0
    return round((completed / planned) * 100)

def test_progress_zero_planned():
    assert calculate_progress(0, 0) == 0

def test_progress_none_completed():
    assert calculate_progress(5, 0) == 0

def test_progress_partial_completed():
    assert calculate_progress(5, 3) == 60

def test_progress_full_completed():
    assert calculate_progress(5, 5) == 100
    
def test_complex_skipped():
    # If there are 5 active (planned), 2 completed. Skipped is not counted as completed, but it remains in denominator unless cancelled.
    assert calculate_progress(5, 2) == 40
