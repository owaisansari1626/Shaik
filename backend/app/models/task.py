from sqlalchemy import Column, String, DateTime, func, Integer, ForeignKey, Date, Time
from sqlalchemy.orm import relationship
from app.db.base import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    priority = Column(String, default="MEDIUM") # HIGH, MEDIUM, LOW
    status = Column(String, default="PENDING") # PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    
    due_date = Column(Date, nullable=True)
    due_time = Column(Time, nullable=True)
    
    estimated_minutes = Column(Integer, nullable=True)
    actual_minutes = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="tasks")
    category = relationship("Category", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")
