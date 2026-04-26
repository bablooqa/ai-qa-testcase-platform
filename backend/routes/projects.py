from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db
from models.enhanced_models import Project, User, Organization
from models.schemas import ProjectCreate, Project as ProjectSchema
from services.ai_service import AIService

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("", response_model=ProjectSchema)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project"""
    try:
        # For MVP, create default organization and user if none exists
        default_org = db.query(Organization).first()
        if not default_org:
            default_org = Organization(
                name="Default Organization",
                description="Default organization for MVP",
                slug="default-org"
            )
            db.add(default_org)
            db.commit()
            db.refresh(default_org)

        default_user = db.query(User).first()
        if not default_user:
            import hashlib
            default_user = User(
                name="Default User",
                email="default@example.com",
                password_hash=hashlib.sha256("default_password".encode()).hexdigest(),
                role="admin"
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
            # Add user to organization via association table
            from models.enhanced_models import organization_members
            db.execute(organization_members.insert().values(
                organization_id=default_org.id,
                user_id=default_user.id,
                role="admin"
            ))
            db.commit()

        db_project = Project(
            name=project.name,
            description=project.description,
            organization_id=default_org.id,
            created_by=default_user.id
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project
    except Exception as e:
        print(f"Error creating project: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[ProjectSchema])
async def get_projects(db: Session = Depends(get_db)):
    """Get all projects"""
    try:
        projects = db.query(Project).all()
        return projects
    except Exception as e:
        print(f"Error fetching projects: {e}")
        return []

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