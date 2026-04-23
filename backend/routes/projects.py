from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db, Project, User
from models.schemas import ProjectCreate, Project as ProjectSchema
from services.ai_service import AIService

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/", response_model=ProjectSchema)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project"""
    # For MVP, create a default user if none exists
    default_user = db.query(User).first()
    if not default_user:
        default_user = User(
            name="Default User",
            email="default@example.com",
            role="admin"
        )
        db.add(default_user)
        db.commit()
        db.refresh(default_user)
    
    db_project = Project(
        name=project.name,
        description=project.description,
        created_by=default_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/", response_model=List[ProjectSchema])
async def get_projects(db: Session = Depends(get_db)):
    """Get all projects"""
    projects = db.query(Project).all()
    return projects

@router.get("/{project_id}", response_model=ProjectSchema)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project