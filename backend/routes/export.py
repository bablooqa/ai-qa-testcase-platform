from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from models.database import get_db, TestCase, Project
from models.schemas import ExportRequest
from services.excel_service import ExcelService

router = APIRouter(prefix="/export", tags=["export"])

@router.post("/excel")
async def export_excel(request: ExportRequest, db: Session = Depends(get_db)):
    """Export test cases to Excel file"""
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get test cases for the project
    test_cases = db.query(TestCase).filter(TestCase.project_id == request.project_id).all()
    
    if not test_cases:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No test cases found for this project"
        )
    
    try:
        # Generate Excel file
        excel_data = ExcelService.export_test_cases(test_cases)
        
        # Return file as response
        filename = f"test_cases_{project.name.replace(' ', '_')}_{request.project_id}.xlsx"
        
        return StreamingResponse(
            BytesIO(excel_data.read()),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting Excel file: {str(e)}"
        )