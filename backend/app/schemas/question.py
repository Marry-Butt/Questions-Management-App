from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.user import UserOut
from app.schemas.department import DepartmentOut

class CommentBase(BaseModel):
    comment: str

class CommentCreate(CommentBase):
    pass

class CommentUserOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class CommentOut(BaseModel):
    id: int
    question_id: int
    user_id: int
    comment: str
    created_at: datetime
    user: CommentUserOut

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    title: str
    description: str
    priority: Optional[str] = "Medium"  # Low, Medium, High
    department_id: int

class QuestionCreate(QuestionBase):
    assigned_to: Optional[int] = None

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    department_id: Optional[int] = None
    assigned_to: Optional[int] = None

class QuestionAssign(BaseModel):
    assigned_to: Optional[int] = None

class QuestionStatusUpdate(BaseModel):
    status: str  # Open, In Progress, Resolved, Closed

class QuestionOut(QuestionBase):
    id: int
    status: str
    created_by: int
    assigned_to: Optional[int] = None
    created_at: datetime
    creator: UserOut
    assignee: Optional[UserOut] = None
    department: DepartmentOut
    comments: List[CommentOut] = []

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_questions: int
    open_questions: int
    resolved_questions: int
    closed_questions: int
    high_priority_questions: int

class NotificationOut(BaseModel):
    id: int
    user_id: int
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
