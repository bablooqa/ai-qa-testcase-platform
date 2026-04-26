"""
Comment System API Routes
Handles collaboration and discussions on test cases
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from models.database import get_db
from models.enhanced_models import Comment, TestCase, Project, User, organization_members
from models.enhanced_schemas import (
    CommentCreate, CommentUpdate, CommentResponse
)

router = APIRouter(prefix="/api/v1/comments", tags=["comments"])


@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_data: CommentCreate,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Add a comment to a test case
    """
    # Check if test case exists and user has access
    test_case = db.query(TestCase).join(
        Project,
        TestCase.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        TestCase.id == comment_data.test_case_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not test_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test case not found or you don't have access"
        )
    
    # Check role permissions (viewers can comment too)
    member = db.query(organization_members).filter(
        organization_members.c.organization_id == Project.organization_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this test case"
        )
    
    # Create comment
    comment = Comment(
        test_case_id=comment_data.test_case_id,
        user_id=current_user_id,
        content=comment_data.content
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    # Get user details for response
    user = db.query(User).filter(User.id == current_user_id).first()
    comment.user_name = user.name if user else None
    comment.user_avatar = user.avatar_url if user else None
    
    return comment


@router.get("/test-case/{test_case_id}", response_model=List[CommentResponse])
async def get_test_case_comments(
    test_case_id: int,
    limit: int = 50,
    offset: int = 0,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Get all comments for a test case
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
    
    # Get comments with user details
    comments = db.query(
        Comment,
        User.name,
        User.avatar_url
    ).join(
        User,
        Comment.user_id == User.id
    ).filter(
        Comment.test_case_id == test_case_id
    ).order_by(
        Comment.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    result = []
    for comment, user_name, user_avatar in comments:
        result.append({
            "id": comment.id,
            "test_case_id": comment.test_case_id,
            "user_id": comment.user_id,
            "user_name": user_name,
            "user_avatar": user_avatar,
            "content": comment.content,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at
        })
    
    return result


@router.get("/test-case/{test_case_id}/count")
async def get_comment_count(
    test_case_id: int,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Get the total comment count for a test case
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
    
    count = db.query(Comment).filter(Comment.test_case_id == test_case_id).count()
    
    return {"test_case_id": test_case_id, "comment_count": count}


@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_data: CommentUpdate,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Update a comment
    Only the comment author can update it
    """
    # Get comment with access check
    result = db.query(Comment, Project).join(
        TestCase,
        Comment.test_case_id == TestCase.id
    ).join(
        Project,
        TestCase.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        Comment.id == comment_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found or you don't have access"
        )
    
    comment, project = result
    
    # Check if user is the author
    if comment.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own comments"
        )
    
    # Update content
    comment.content = comment_data.content
    
    db.commit()
    db.refresh(comment)
    
    # Get user details
    user = db.query(User).filter(User.id == current_user_id).first()
    comment.user_name = user.name if user else None
    comment.user_avatar = user.avatar_url if user else None
    
    return comment


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Delete a comment
    Only the comment author or admin can delete
    """
    # Get comment with access check
    result = db.query(Comment, Project).join(
        TestCase,
        Comment.test_case_id == TestCase.id
    ).join(
        Project,
        TestCase.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        Comment.id == comment_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found or you don't have access"
        )
    
    comment, project = result
    
    # Check permissions (author or admin)
    member = db.query(organization_members).filter(
        organization_members.c.organization_id == project.organization_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if comment.user_id != current_user_id and member.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments (or admin can delete any)"
        )
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}


@router.post("/{comment_id}/mention")
async def mention_user_in_comment(
    comment_id: int,
    mentioned_user_email: str,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Mention a user in a comment (sends notification)
    This is a placeholder for future notification system
    """
    # Get comment with access check
    result = db.query(Comment, Project).join(
        TestCase,
        Comment.test_case_id == TestCase.id
    ).join(
        Project,
        TestCase.project_id == Project.id
    ).join(
        organization_members,
        Project.organization_id == organization_members.c.organization_id
    ).filter(
        Comment.id == comment_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found or you don't have access"
        )
    
    comment, project = result
    
    # Check if mentioned user exists in organization
    mentioned_user = db.query(User).join(
        organization_members,
        User.id == organization_members.c.user_id
    ).filter(
        User.email == mentioned_user_email,
        organization_members.c.organization_id == project.organization_id
    ).first()
    
    if not mentioned_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {mentioned_user_email} not found in this organization"
        )
    
    # TODO: Send email notification or in-app notification
    # For now, just return success
    
    return {
        "message": f"User {mentioned_user_email} will be notified",
        "mentioned_user_id": mentioned_user.id,
        "mentioned_user_name": mentioned_user.name
    }
