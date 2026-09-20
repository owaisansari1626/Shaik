from sqlalchemy import Column, String, DateTime, func, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    activity_type = Column(String, default="ROUTINE") # ROUTINE, WORKOUT, STUDY, etc.
    
    default_duration_minutes = Column(Integer, default=60)
    is_recurring = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="activities")
    category = relationship("Category", back_populates="activities")
    
    recurrence_rule = relationship("RecurrenceRule", back_populates="activity", uselist=False, cascade="all, delete-orphan")
    occurrences = relationship("ActivityOccurrence", back_populates="activity", cascade="all, delete-orphan")
