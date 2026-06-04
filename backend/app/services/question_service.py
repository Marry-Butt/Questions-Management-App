from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.question import Question
from app.models.comment import Comment
from app.models.department import Department
from app.models.notification import Notification
from app.schemas.question import QuestionCreate, QuestionUpdate
from datetime import datetime

def create_notification(db: Session, user_id: int, message: str, type: str):
    notification = Notification(
        user_id=user_id,
        message=message,
        type=type,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

def get_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

def mark_notifications_read(db: Session, user_id: int):
    db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({"is_read": True})
    db.commit()

def create_question(db: Session, question: QuestionCreate, creator_id: int):
    db_question = Question(
        title=question.title,
        description=question.description,
        priority=question.priority,
        department_id=question.department_id,
        assigned_to=question.assigned_to,
        created_by=creator_id,
        status="Open"
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    # Notify if assigned
    if db_question.assigned_to:
        create_notification(
            db, 
            db_question.assigned_to, 
            f"You have been assigned a new question: {db_question.title}", 
            "assignment"
        )
        
    return db_question

def get_question_by_id(db: Session, question_id: int):
    return db.query(Question).filter(Question.id == question_id).first()

def get_questions(db: Session, status: str = None, priority: str = None, department_id: int = None, assigned_to: int = None):
    query = db.query(Question)
    if status:
        query = query.filter(Question.status == status)
    if priority:
        query = query.filter(Question.priority == priority)
    if department_id:
        query = query.filter(Question.department_id == department_id)
    if assigned_to:
        query = query.filter(Question.assigned_to == assigned_to)
    return query.order_by(Question.created_at.desc()).all()

def update_question(db: Session, db_question: Question, update_data: QuestionUpdate):
    for key, value in update_data.model_dump(exclude_unset=True).items():
        # Handle notification on assignment change
        if key == "assigned_to" and value != db_question.assigned_to and value:
            create_notification(
                db, 
                value, 
                f"You have been assigned a question: {db_question.title}", 
                "assignment"
            )
        # Handle notification on status change
        if key == "status" and value != db_question.status:
            create_notification(
                db, 
                db_question.created_by, 
                f"Your question '{db_question.title}' status was updated to {value}", 
                "status_change"
            )
            if db_question.assigned_to:
                create_notification(
                    db, 
                    db_question.assigned_to, 
                    f"Assigned question '{db_question.title}' status was updated to {value}", 
                    "status_change"
                )
        setattr(db_question, key, value)
    
    db.commit()
    db.refresh(db_question)
    return db_question

def delete_question(db: Session, question_id: int):
    db_question = get_question_by_id(db, question_id)
    if db_question:
        db.delete(db_question)
        db.commit()
        return True
    return False

def add_comment(db: Session, question_id: int, user_id: int, comment_text: str):
    db_comment = Comment(
        question_id=question_id,
        user_id=user_id,
        comment=comment_text
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    # Notify users
    db_question = get_question_by_id(db, question_id)
    if db_question:
        # Notify the assignee if creator commented
        if user_id == db_question.created_by and db_question.assigned_to:
            create_notification(
                db,
                db_question.assigned_to,
                f"Creator added a comment on: '{db_question.title}'",
                "comment"
            )
        # Notify creator if assignee (or anyone else) commented
        elif user_id != db_question.created_by:
            create_notification(
                db,
                db_question.created_by,
                f"New comment added on your question: '{db_question.title}'",
                "comment"
            )

    return db_comment

def get_dashboard_stats(db: Session):
    total = db.query(Question).count()
    open_q = db.query(Question).filter(Question.status == "Open").count()
    in_progress_q = db.query(Question).filter(Question.status == "In Progress").count()
    resolved = db.query(Question).filter(Question.status == "Resolved").count()
    closed = db.query(Question).filter(Question.status == "Closed").count()
    high_prio = db.query(Question).filter(Question.priority == "High").count()

    return {
        "total_questions": total,
        "open_questions": open_q + in_progress_q,  # combine active open questions
        "resolved_questions": resolved,
        "closed_questions": closed,
        "high_priority_questions": high_prio
    }
