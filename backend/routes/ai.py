from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.database import get_db, TestCase, Project
from models.schemas import GenerateTestCaseRequest, TestCase as TestCaseSchema
from services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])
ai_service = AIService()

@router.post("/generate-testcases", response_model=list[TestCaseSchema])
async def generate_test_cases(
    request: GenerateTestCaseRequest,
    db: Session = Depends(get_db)
):
    """Generate test cases using AI"""
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    try:
        # Generate test cases using AI
        generated_cases = await ai_service.generate_test_cases(
            request.requirement,
            request.feature_name
        )
        
        if not generated_cases:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate test cases"
            )
        
        # Save generated test cases to database
        saved_cases = []
        for case_data in generated_cases:
            test_case = TestCase(
                project_id=request.project_id,
                title=case_data.get("title", "Untitled Test Case"),
                steps=case_data.get("steps", ""),
                expected_result=case_data.get("expected_result", ""),
                priority=case_data.get("priority", "medium"),
                status="draft"
            )
            db.add(test_case)
            db.commit()
            db.refresh(test_case)
            saved_cases.append(test_case)
        
        return saved_cases
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating test cases: {str(e)}"
        )