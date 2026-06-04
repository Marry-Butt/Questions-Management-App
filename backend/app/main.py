from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import engine, Base, SessionLocal
from app.api import auth, users, departments, questions, dashboard
from app.models.user import User
from app.models.department import Department
from app.models.question import Question
from app.models.comment import Comment
from app.models.notification import Notification
from app.core.security import get_password_hash

# Auto-create tables (for development and SQLite/PostgreSQL convenience)
Base.metadata.create_all(bind=engine)

# Seed function to populate demo data
def seed_database():
    db = SessionLocal()
    try:
        # 1. Seed demo users
        if db.query(User).count() == 0:
            admin = User(
                name="System Admin",
                email="admin@example.com",
                password=get_password_hash("admin123"),
                role="admin"
            )
            manager = User(
                name="Alice Manager",
                email="manager@example.com",
                password=get_password_hash("manager123"),
                role="manager"
            )
            employee = User(
                name="Bob Employee",
                email="employee@example.com",
                password=get_password_hash("employee123"),
                role="employee"
            )
            db.add_all([admin, manager, employee])
            db.commit()
            print("Successfully seeded users: admin@example.com, manager@example.com, employee@example.com (passwords: admin123, manager123, employee123)")
            
        # 2. Seed departments
        if db.query(Department).count() == 0:
            dept1 = Department(name="IT Support", description="Technical and system support issues")
            dept2 = Department(name="Human Resources", description="HR, payroll, and recruitment questions")
            dept3 = Department(name="Finance", description="Expense reports, billing, and invoicing questions")
            db.add_all([dept1, dept2, dept3])
            db.commit()
            print("Successfully seeded departments: IT Support, Human Resources, Finance")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

seed_database()

app = FastAPI(
    title="Questions Management App API",
    description="Backend API for role-based Questions Management",
    version="1.0.0",
    redirect_slashes=False
)

# CORS configurations - Allow Vite dev server
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes under /api prefix to match frontend dev proxy
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(departments.router, prefix="/api")
app.include_router(questions.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Questions Management App Backend"}
