from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.db import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, default="Medium")  # Low, Medium, High
    status = Column(String, default="Open")  # Open, In Progress, Resolved, Closed
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    department = relationship("Department", back_populates="questions")
    creator = relationship("User", back_populates="created_questions", foreign_keys=[created_by])
    assignee = relationship("User", back_populates="assigned_questions", foreign_keys=[assigned_to])
    comments = relationship("Comment", back_populates="question", cascade="all, delete-orphan")
