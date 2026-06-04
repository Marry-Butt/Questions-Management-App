from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.db import get_db
from app.schemas.department import DepartmentOut, DepartmentCreate, DepartmentUpdate
from app.models.department import Department
from app.models.question import Question
from app.api.auth import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("/", response_model=List[DepartmentOut])
def get_departments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Department).order_by(Department.name).all()

@router.post("/", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    dept: DepartmentCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    existing = db.query(Department).filter(Department.name == dept.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this name already exists")
    
    db_dept = Department(name=dept.name, description=dept.description)
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.put("/{dept_id}", response_model=DepartmentOut)
def update_department(
    dept_id: int,
    dept_update: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
        
    if dept_update.name:
        existing = db.query(Department).filter(Department.name == dept_update.name, Department.id != dept_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Department name already taken")
        dept.name = dept_update.name
        
    if dept_update.description is not None:
        dept.description = dept_update.description
        
    db.commit()
    db.refresh(dept)
    return dept

@router.delete("/{dept_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if there are questions associated with this department
    linked_questions = db.query(Question).filter(Question.department_id == dept_id).count()
    if linked_questions > 0:
        raise HTTPException(status_code=400, detail="Cannot delete department. There are active questions assigned to it.")
        
    db.delete(dept)
    db.commit()
    return None
