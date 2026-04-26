from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db
from models.enhanced_models import TestCase, Project
from models.schemas import TestCase as TestCaseSchema, GenerateTestCaseRequest
from services.ai_service import AIService

router = APIRouter(prefix="/testcases", tags=["testcases"])

@router.get("/project/{project_id}", response_model=List[TestCaseSchema])
async def get_test_cases(project_id: int, db: Session = Depends(get_db)):
    """Get all test cases for a project"""
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    test_cases = db.query(TestCase).filter(TestCase.project_id == project_id).all()
    return test_cases

@router.put("/{test_case_id}", response_model=TestCaseSchema)
async def update_test_case(
    test_case_id: int,
    test_case_data: dict,
    db: Session = Depends(get_db)
):
    """Update a test case"""
    test_case = db.query(TestCase).filter(TestCase.id == test_case_id).first()
    if not test_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test case not found"
        )
    
    # Update fields
    for field, value in test_case_data.items():
        if hasattr(test_case, field):
            setattr(test_case, field, value)
    
    db.commit()
    db.refresh(test_case)
    return test_case

@router.delete("/{test_case_id}")
async def delete_test_case(test_case_id: int, db: Session = Depends(get_db)):
    """Delete a test case"""
    test_case = db.query(TestCase).filter(TestCase.id == test_case_id).first()
    if not test_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test case not found"
        )
    
    db.delete(test_case)
    db.commit()
    return {"message": "Test case deleted successfully"}

@router.post("/generate", response_model=List[TestCaseSchema])
async def generate_test_cases(request: GenerateTestCaseRequest, db: Session = Depends(get_db)):
    """Generate test cases using AI"""
    # Check if project exists
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    try:
        ai_service = AIService()
        generated_cases = await ai_service.generate_test_cases(
            requirement=request.requirement,
            feature_name=request.feature_name
        )
        
        # Save generated test cases to database
        saved_cases = []
        for case_data in generated_cases:
            test_case = TestCase(
                title=case_data.get("title", ""),
                steps=case_data.get("steps", ""),
                expected_result=case_data.get("expected_result", ""),
                priority=case_data.get("priority", "medium"),
                status="draft",
                project_id=request.project_id,
                created_by=1  # Default user for MVP
            )
            db.add(test_case)
            db.commit()
            db.refresh(test_case)
            saved_cases.append(test_case)
        
        return saved_cases
    except Exception as e:
        print(f"Error generating test cases: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate test cases: {str(e)}"
        )