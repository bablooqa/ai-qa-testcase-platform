"""
Test Execution API Routes
Handles test execution tracking (Pass/Fail/Blocked/Skipped)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

from models.database import get_db
from models.enhanced_models import (
    TestExecution, TestCase, Project, User, organization_members
)
from models.enhanced_schemas import (
    TestExecutionCreate, TestExecutionResponse, ExecutionStatus, ExecutionStats
)

router = APIRouter(prefix="/executions", tags=["executions"])


@router.post("", response_model=TestExecutionResponse, status_code=status.HTTP_201_CREATED)
async def create_execution(
    exec_data: TestExecutionCreate,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Execute a test case and record the result
    """
    # Get test case with project info
    test_case = db.query(TestCase).join(
        Project,
        TestCase.project_id == Project.id
    ).filter(
        TestCase.id == exec_data.test_case_id
    ).first()
    
    if not test_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test case not found"
        )
    
    # Check organization access
    is_member = db.query(organization_members).filter(
        organization_members.c.organization_id == Project.organization_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this test case"
        )
    
    # Validate status
    if exec_data.status not in [s.value for s in ExecutionStatus]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {[s.value for s in ExecutionStatus]}"
        )
    
    # Create execution record
    execution = TestExecution(
        test_case_id=exec_data.test_case_id,
        status=exec_data.status.value,
        comments=exec_data.comments,
        executed_by=current_user_id,
        environment=exec_data.environment,
        browser=exec_data.browser,
        version=exec_data.version,
        attachment_url=exec_data.attachment_url
    )
    
    db.add(execution)
    db.commit()
    db.refresh(execution)
    
    # Update test case last execution info
    test_case.last_execution_status = exec_data.status.value
    db.commit()
    
    # Get user name for response
    user = db.query(User).filter(User.id == current_user_id).first()
    execution.executed_by_name = user.name if user else None
    
    return execution


@router.get("", response_model=List[TestExecutionResponse])
async def list_executions(
    test_case_id: Optional[int] = None,
    project_id: Optional[int] = None,
    status: Optional[ExecutionStatus] = None,
    executed_by: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    List test executions with filtering
    """
    query = db.query(TestExecution).join(
        TestCase,
        TestExecution.test_case_id == TestCase.id
    ).join(
        Project,
        TestCase.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        organization_members.c.user_id == current_user_id
    )
    
    # Apply filters
    if test_case_id:
        query = query.filter(TestExecution.test_case_id == test_case_id)
    
    if project_id:
        query = query.filter(TestCase.project_id == project_id)
    
    if status:
        query = query.filter(TestExecution.status == status.value)
    
    if executed_by:
        query = query.filter(TestExecution.executed_by == executed_by)
    
    # Order by most recent first
    executions = query.order_by(TestExecution.executed_at.desc()).offset(offset).limit(limit).all()
    
    # Add user names
    for exec in executions:
        user = db.query(User).filter(User.id == exec.executed_by).first()
        exec.executed_by_name = user.name if user else None
    
    return executions


@router.get("/stats", response_model=ExecutionStats)
async def get_execution_stats(
    project_id: Optional[int] = None,
    test_case_id: Optional[int] = None,
    days: int = 30,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Get execution statistics
    """
    query = db.query(TestExecution).join(
        TestCase,
        TestExecution.test_case_id == TestCase.id
    ).join(
        Project,
        TestCase.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        organization_members.c.user_id == current_user_id,
        TestExecution.executed_at >= datetime.now() - timedelta(days=days)
    )
    
    if project_id:
        query = query.filter(TestCase.project_id == project_id)
    
    if test_case_id:
        query = query.filter(TestExecution.test_case_id == test_case_id)
    
    executions = query.all()
    
    # Calculate stats
    total = len(executions)
    pass_count = sum(1 for e in executions if e.status == "pass")
    fail_count = sum(1 for e in executions if e.status == "fail")
    blocked_count = sum(1 for e in executions if e.status == "blocked")
    skipped_count = sum(1 for e in executions if e.status == "skipped")
    
    pass_rate = (pass_count / total * 100) if total > 0 else 0
    
    return ExecutionStats(
        total_executions=total,
        pass_count=pass_count,
        fail_count=fail_count,
        blocked_count=blocked_count,
        skipped_count=skipped_count,
        pass_rate=round(pass_rate, 2)
    )


@router.get("/recent")
async def get_recent_executions(
    limit: int = 10,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Get recent test executions across all accessible projects
    """
    executions = db.query(
        TestExecution,
        TestCase.title,
        Project.name.label("project_name")
    ).join(
        TestCase,
        TestExecution.test_case_id == TestCase.id
    ).join(
        Project,
        TestCase.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        organization_members.c.user_id == current_user_id
    ).order_by(
        TestExecution.executed_at.desc()
    ).limit(limit).all()
    
    result = []
    for exec, test_case_title, project_name in executions:
        user = db.query(User).filter(User.id == exec.executed_by).first()
        
        result.append({
            "id": exec.id,
            "test_case_id": exec.test_case_id,
            "test_case_title": test_case_title,
            "project_name": project_name,
            "status": exec.status,
            "executed_by": exec.executed_by,
            "executed_by_name": user.name if user else None,
            "executed_at": exec.executed_at,
            "environment": exec.environment
        })
    
    return result


@router.get("/history/{test_case_id}")
async def get_test_case_execution_history(
    test_case_id: int,
    limit: int = 20,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Get execution history for a specific test case
    """
    # Check access
    test_case = db.query(TestCase).join(
        Project,
        TestCase.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        TestCase.id == test_case_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not test_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test case not found or you don't have access"
        )
    
    executions = db.query(TestExecution).filter(
        TestExecution.test_case_id == test_case_id
    ).order_by(TestExecution.executed_at.desc()).limit(limit).all()
    
    # Add user names
    for exec in executions:
        user = db.query(User).filter(User.id == exec.executed_by).first()
        exec.executed_by_name = user.name if user else None
    
    return executions


@router.get("/dashboard/summary")
async def get_execution_summary_for_dashboard(
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Get execution summary for dashboard display
    """
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Base query with organization access
    base_query = db.query(TestExecution).join(
        TestCase,
        TestExecution.test_case_id == TestCase.id
    ).join(
        Project,
        TestCase.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        organization_members.c.user_id == current_user_id
    )
    
    # Today's executions
    today_count = base_query.filter(TestExecution.executed_at >= today).count()
    
    # This week's executions
    week_count = base_query.filter(TestExecution.executed_at >= week_ago).count()
    
    # This month's executions
    month_count = base_query.filter(TestExecution.executed_at >= month_ago).count()
    
    # Status breakdown
    status_counts = {}
    for status in ["pass", "fail", "blocked", "skipped"]:
        count = base_query.filter(TestExecution.status == status).count()
        status_counts[status] = count
    
    # Pass rate this month
    month_executions = base_query.filter(TestExecution.executed_at >= month_ago).all()
    month_total = len(month_executions)
    month_pass = sum(1 for e in month_executions if e.status == "pass")
    month_pass_rate = (month_pass / month_total * 100) if month_total > 0 else 0
    
    return {
        "today": today_count,
        "this_week": week_count,
        "this_month": month_count,
        "status_breakdown": status_counts,
        "month_pass_rate": round(month_pass_rate, 2),
        "trend": "up" if today_count > 0 else "stable"
    }


@router.put("/{execution_id}")
async def update_execution(
    execution_id: int,
    exec_data: TestExecutionCreate,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Update an execution record (for corrections)
    Only the person who executed or admin can update
    """
    execution = db.query(TestExecution).join(
        TestCase,
        TestExecution.test_case_id == TestCase.id
    ).join(
        Project,
        TestCase.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        TestExecution.id == execution_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found or you don't have access"
        )
    
    # Check permissions (only executor or admin can update)
    member = db.query(organization_members).filter(
        organization_members.c.organization_id == Project.organization_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if execution.executed_by != current_user_id and member.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the person who executed or admin can update"
        )
    
    # Update fields
    if exec_data.status:
        execution.status = exec_data.status.value
        # Update test case last execution status
        test_case = db.query(TestCase).filter(TestCase.id == execution.test_case_id).first()
        if test_case:
            test_case.last_execution_status = exec_data.status.value
    
    if exec_data.comments is not None:
        execution.comments = exec_data.comments
    
    if exec_data.environment is not None:
        execution.environment = exec_data.environment
    
    if exec_data.browser is not None:
        execution.browser = exec_data.browser
    
    if exec_data.version is not None:
        execution.version = exec_data.version
    
    if exec_data.attachment_url is not None:
        execution.attachment_url = exec_data.attachment_url
    
    db.commit()
    db.refresh(execution)
    
    return {"message": "Execution updated successfully"}
