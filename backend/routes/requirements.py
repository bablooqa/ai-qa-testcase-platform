"""
Requirement Management API Routes
Handles User Stories, PRDs, API Specs, and Figma links
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from models.database import get_db
from models.enhanced_models import Requirement, Project, TestCase, organization_members
from models.enhanced_schemas import (
    RequirementCreate, RequirementUpdate, RequirementResponse,
    RequirementType, TestCasePriority
)

router = APIRouter(prefix="/requirements", tags=["requirements"])


@router.post("", response_model=RequirementResponse, status_code=status.HTTP_201_CREATED)
async def create_requirement(
    req_data: RequirementCreate,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Create a new requirement (User Story, PRD, API Spec, etc.)
    """
    # Check if project exists and user has access
    project = db.query(Project).filter(Project.id == req_data.project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check organization membership
    is_member = db.query(organization_members).filter(
        organization_members.c.organization_id == project.organization_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this project"
        )
    
    # Create requirement
    requirement = Requirement(
        project_id=req_data.project_id,
        title=req_data.title,
        description=req_data.description,
        requirement_type=req_data.requirement_type.value,
        priority=req_data.priority.value,
        status=req_data.status,
        external_id=req_data.external_id,
        external_url=req_data.external_url
    )
    
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    
    # Calculate test case count
    test_case_count = db.query(TestCase).filter(
        TestCase.requirement_id == requirement.id
    ).count()
    
    # Add computed field
    requirement.test_case_count = test_case_count
    
    return requirement


@router.get("", response_model=List[RequirementResponse])
async def list_requirements(
    project_id: Optional[int] = None,
    requirement_type: Optional[RequirementType] = None,
    priority: Optional[TestCasePriority] = None,
    status: Optional[str] = None,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    List requirements with optional filtering
    """
    query = db.query(Requirement).join(
        Project,
        Requirement.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        organization_members.c.user_id == current_user_id
    )
    
    # Apply filters
    if project_id:
        query = query.filter(Requirement.project_id == project_id)
    
    if requirement_type:
        query = query.filter(Requirement.requirement_type == requirement_type.value)
    
    if priority:
        query = query.filter(Requirement.priority == priority.value)
    
    if status:
        query = query.filter(Requirement.status == status)
    
    requirements = query.order_by(Requirement.created_at.desc()).all()
    
    # Add test case counts
    for req in requirements:
        req.test_case_count = db.query(TestCase).filter(
            TestCase.requirement_id == req.id
        ).count()
    
    return requirements


@router.get("/{requirement_id}", response_model=RequirementResponse)
async def get_requirement(
    requirement_id: int,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Get requirement details by ID
    """
    requirement = db.query(Requirement).join(
        Project,
        Requirement.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        Requirement.id == requirement_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found or you don't have access"
        )
    
    # Add test case count
    requirement.test_case_count = db.query(TestCase).filter(
        TestCase.requirement_id == requirement.id
    ).count()
    
    return requirement


@router.put("/{requirement_id}", response_model=RequirementResponse)
async def update_requirement(
    requirement_id: int,
    req_data: RequirementUpdate,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Update requirement details
    """
    # Get requirement with access check
    requirement = db.query(Requirement).join(
        Project,
        Requirement.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        Requirement.id == requirement_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found or you don't have access"
        )
    
    # Check role permissions (only admin/qa can update)
    member = db.query(organization_members).filter(
        organization_members.c.organization_id == Project.organization_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if member.role == "viewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot update requirements"
        )
    
    # Update fields
    if req_data.title is not None:
        requirement.title = req_data.title
    
    if req_data.description is not None:
        requirement.description = req_data.description
    
    if req_data.requirement_type is not None:
        requirement.requirement_type = req_data.requirement_type.value
    
    if req_data.priority is not None:
        requirement.priority = req_data.priority.value
    
    if req_data.status is not None:
        requirement.status = req_data.status
    
    if req_data.external_id is not None:
        requirement.external_id = req_data.external_id
    
    if req_data.external_url is not None:
        requirement.external_url = req_data.external_url
    
    db.commit()
    db.refresh(requirement)
    
    # Add test case count
    requirement.test_case_count = db.query(TestCase).filter(
        TestCase.requirement_id == requirement.id
    ).count()
    
    return requirement


@router.delete("/{requirement_id}")
async def delete_requirement(
    requirement_id: int,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Delete a requirement
    Only admins can delete requirements
    """
    # Get requirement with access check
    result = db.query(Requirement, Project).join(
        Project,
        Requirement.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        Requirement.id == requirement_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found or you don't have access"
        )
    
    requirement, project = result
    
    # Check admin permission
    member = db.query(organization_members).filter(
        organization_members.c.organization_id == project.organization_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if member.role not in ["admin", "qa_engineer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and QA engineers can delete requirements"
        )
    
    # Check if requirement has linked test cases
    linked_test_cases = db.query(TestCase).filter(
        TestCase.requirement_id == requirement_id
    ).count()
    
    if linked_test_cases > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete requirement with {linked_test_cases} linked test cases. Unlink them first."
        )
    
    db.delete(requirement)
    db.commit()
    
    return {"message": "Requirement deleted successfully"}


@router.get("/{requirement_id}/test-cases")
async def get_requirement_test_cases(
    requirement_id: int,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Get all test cases linked to a requirement
    """
    # Check access
    requirement = db.query(Requirement).join(
        Project,
        Requirement.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        Requirement.id == requirement_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found or you don't have access"
        )
    
    # Get test cases
    test_cases = db.query(TestCase).filter(
        TestCase.requirement_id == requirement_id
    ).all()
    
    return test_cases


@router.get("/stats/overview")
async def get_requirements_stats(
    project_id: Optional[int] = None,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Get statistics about requirements
    """
    query = db.query(Requirement).join(
        Project,
        Requirement.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        organization_members.c.user_id == current_user_id
    )
    
    if project_id:
        query = query.filter(Requirement.project_id == project_id)
    
    requirements = query.all()
    
    # Calculate stats
    total = len(requirements)
    by_type = {}
    by_priority = {}
    by_status = {}
    
    for req in requirements:
        # By type
        req_type = req.requirement_type
        by_type[req_type] = by_type.get(req_type, 0) + 1
        
        # By priority
        priority = req.priority
        by_priority[priority] = by_priority.get(priority, 0) + 1
        
        # By status
        status_val = req.status
        by_status[status_val] = by_status.get(status_val, 0) + 1
    
    # Calculate coverage (requirements with test cases)
    with_test_cases = 0
    for req in requirements:
        test_case_count = db.query(TestCase).filter(
            TestCase.requirement_id == req.id
        ).count()
        if test_case_count > 0:
            with_test_cases += 1
    
    coverage_percent = (with_test_cases / total * 100) if total > 0 else 0
    
    return {
        "total_requirements": total,
        "with_test_cases": with_test_cases,
        "without_test_cases": total - with_test_cases,
        "coverage_percent": round(coverage_percent, 2),
        "by_type": by_type,
        "by_priority": by_priority,
        "by_status": by_status
    }
