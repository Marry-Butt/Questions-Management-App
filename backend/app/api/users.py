from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.db import get_db
from app.schemas.user import UserOut, UserUpdate
from app.models.user import User
from app.api.auth import get_current_user, require_role

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    return db.query(User).order_by(User.id).all()

@router.get("/assignable", response_model=List[UserOut])
def get_assignable_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Managers and employees can be assigned questions
    return db.query(User).filter(User.role.in_(["manager", "employee"])).order_by(User.name).all()

@router.put("/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int, 
    role_update: UserUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if role_update.role not in ["admin", "manager", "employee"]:
        raise HTTPException(status_code=400, detail="Invalid role name")
        
    user.role = role_update.role
    db.commit()
    db.refresh(user)
    return user
