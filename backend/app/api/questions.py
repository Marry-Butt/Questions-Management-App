from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database.db import get_db
from app.schemas.question import (
    QuestionOut, QuestionCreate, QuestionUpdate, 
    CommentOut, CommentCreate, NotificationOut
)
from app.models.question import Question
from app.models.user import User
from app.api.auth import get_current_user, require_role
from app.services import question_service

router = APIRouter(tags=["Questions"])

# Helper request schemas for top-level assignment and status endpoints
class AssignmentRequest(BaseModel):
    question_id: int
    assigned_to: Optional[int] = None

class StatusChangeRequest(BaseModel):
    question_id: int
    status: str

@router.get("/questions", response_model=List[QuestionOut])
def list_questions(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    department_id: Optional[int] = None,
    assigned_to: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # If employee, they can query questions, but we don't automatically restrict all list lookups.
    # We can filter if they request their assigned questions by passing assigned_to=current_user.id.
    return question_service.get_questions(
        db, status=status, priority=priority, department_id=department_id, assigned_to=assigned_to
    )

@router.post("/questions", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
def create_new_question(
    question: QuestionCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    return question_service.create_question(db, question, current_user.id)

@router.get("/questions/{question_id}", response_model=QuestionOut)
def read_question(
    question_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    db_question = question_service.get_question_by_id(db, question_id)
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_question

@router.put("/questions/{question_id}", response_model=QuestionOut)
def update_question_details(
    question_id: int, 
    question_update: QuestionUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    db_question = question_service.get_question_by_id(db, question_id)
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question_service.update_question(db, db_question, question_update)

@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_question(
    question_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    success = question_service.delete_question(db, question_id)
    if not success:
        raise HTTPException(status_code=404, detail="Question not found")
    return None

# Assignment APIs
@router.post("/assign-question", response_model=QuestionOut)
def assign_question(
    req: AssignmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    db_question = question_service.get_question_by_id(db, req.question_id)
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Ensure assignable user exists and is a manager or employee
    if req.assigned_to:
        assignee = db.query(User).filter(User.id == req.assigned_to).first()
        if not assignee or assignee.role not in ["manager", "employee"]:
            raise HTTPException(status_code=400, detail="User is not assignable")
            
    update_data = QuestionUpdate(assigned_to=req.assigned_to)
    return question_service.update_question(db, db_question, update_data)

# Status Tracking API
@router.put("/change-status", response_model=QuestionOut)
def change_status(
    req: StatusChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_question = question_service.get_question_by_id(db, req.question_id)
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    # Check permissions: Admin/Manager can change status anytime.
    # Employee can change status only if they are the assignee.
    if current_user.role == "employee" and db_question.assigned_to != current_user.id:
        raise HTTPException(
            status_code=403, 
            detail="You are not authorized to change the status of this question as you are not the assignee."
        )
        
    if req.status not in ["Open", "In Progress", "Resolved", "Closed"]:
        raise HTTPException(status_code=400, detail="Invalid status value")
        
    update_data = QuestionUpdate(status=req.status)
    return question_service.update_question(db, db_question, update_data)

# Comments System
@router.post("/questions/{question_id}/comments", response_model=CommentOut)
def post_comment(
    question_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_question = question_service.get_question_by_id(db, question_id)
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    return question_service.add_comment(db, question_id, current_user.id, comment_data.comment)

# Notifications System
@router.get("/notifications", response_model=List[NotificationOut])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return question_service.get_notifications(db, current_user.id)

@router.post("/notifications/read")
def read_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question_service.mark_notifications_read(db, current_user.id)
    return {"message": "Notifications marked as read"}
