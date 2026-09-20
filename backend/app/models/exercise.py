from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True) 
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"

    id = Column(Integer, primary_key=True, index=True)
    workout_session_id = Column(Integer, ForeignKey("workout_sessions.id"), nullable=False)
    exercise_name = Column(String, nullable=False) # Can be a string or mapped to Exercise.id
    exercise_order = Column(Integer, nullable=False, default=0)
    notes = Column(String, nullable=True)

    session = relationship("WorkoutSession", back_populates="exercises")
    sets = relationship("WorkoutSet", back_populates="exercise", cascade="all, delete-orphan")

class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id = Column(Integer, primary_key=True, index=True)
    workout_exercise_id = Column(Integer, ForeignKey("workout_exercises.id"), nullable=False)
    set_number = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)
    duration = Column(Integer, nullable=True) # Seconds, for holds/planks
    rest_seconds = Column(Integer, nullable=True)
    completed = Column(Boolean, default=False)

    exercise = relationship("WorkoutExercise", back_populates="sets")

class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    exercises = Column(JSON, nullable=False) # Store exercise names or definitions payload
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
