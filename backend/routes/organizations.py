"""
Organization Management API Routes
Handles multi-tenancy, team members, and organization settings
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import re

from models.database import get_db
from models.enhanced_models import Organization, User, organization_members
from models.enhanced_schemas import (
    OrganizationCreate, OrganizationUpdate, OrganizationResponse,
    OrganizationMemberResponse, InviteMemberRequest, InviteMemberResponse,
    UserRole
)

router = APIRouter(prefix="/organizations", tags=["organizations"])


def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from organization name"""
    slug = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Create a new organization.
    The creator automatically becomes an admin.
    """
    # Generate unique slug
    base_slug = generate_slug(org_data.name)
    slug = base_slug
    counter = 1
    
    while db.query(Organization).filter(Organization.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    # Create organization
    organization = Organization(
        name=org_data.name,
        slug=slug,
        description=org_data.description,
        logo_url=org_data.logo_url,
        subscription_plan="free",
        max_users=5,
        max_projects=3
    )
    
    db.add(organization)
    db.commit()
    db.refresh(organization)
    
    # Add creator as admin
    db.execute(
        organization_members.insert().values(
            organization_id=organization.id,
            user_id=current_user_id,
            role="admin"
        )
    )
    db.commit()
    
    return organization


@router.get("", response_model=List[OrganizationResponse])
async def list_organizations(
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    List all organizations where the current user is a member
    """
    organizations = db.query(Organization).join(
        organization_members,
        Organization.id == organization_members.c.organization_id
    ).filter(
        organization_members.c.user_id == current_user_id
    ).all()
    
    return organizations


@router.get("/{organization_id}", response_model=OrganizationResponse)
async def get_organization(
    organization_id: int,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Get organization details by ID
    """
    # Check if user is member
    is_member = db.query(organization_members).filter(
        organization_members.c.organization_id == organization_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this organization"
        )
    
    organization = db.query(Organization).filter(
        Organization.id == organization_id
    ).first()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return organization


@router.put("/{organization_id}", response_model=OrganizationResponse)
async def update_organization(
    organization_id: int,
    org_data: OrganizationUpdate,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Update organization details
    Only admins can update organization
    """
    # Check if user is admin
    member = db.query(organization_members).filter(
        organization_members.c.organization_id == organization_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not member or member.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization admins can update settings"
        )
    
    organization = db.query(Organization).filter(
        Organization.id == organization_id
    ).first()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Update fields
    if org_data.name is not None:
        organization.name = org_data.name
        # Update slug if name changes
        base_slug = generate_slug(org_data.name)
        slug = base_slug
        counter = 1
        while db.query(Organization).filter(
            Organization.slug == slug,
            Organization.id != organization_id
        ).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        organization.slug = slug
    
    if org_data.description is not None:
        organization.description = org_data.description
    
    if org_data.logo_url is not None:
        organization.logo_url = org_data.logo_url
    
    db.commit()
    db.refresh(organization)
    
    return organization


@router.post("/{organization_id}/invite", response_model=InviteMemberResponse)
async def invite_member(
    organization_id: int,
    invite_data: InviteMemberRequest,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Invite a new member to the organization
    Only admins can invite members
    """
    # Check if user is admin
    member = db.query(organization_members).filter(
        organization_members.c.organization_id == organization_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not member or member.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization admins can invite members"
        )
    
    organization = db.query(Organization).filter(
        Organization.id == organization_id
    ).first()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Check if organization has reached user limit
    current_member_count = db.query(func.count(organization_members.c.user_id)).filter(
        organization_members.c.organization_id == organization_id
    ).scalar()
    
    if current_member_count >= organization.max_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Organization has reached the maximum limit of {organization.max_users} users"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == invite_data.email).first()
    
    if existing_user:
        # Check if already a member
        existing_member = db.query(organization_members).filter(
            organization_members.c.organization_id == organization_id,
            organization_members.c.user_id == existing_user.id
        ).first()
        
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this organization"
            )
        
        # Add existing user to organization
        db.execute(
            organization_members.insert().values(
                organization_id=organization_id,
                user_id=existing_user.id,
                role=invite_data.role.value
            )
        )
        db.commit()
        
        return InviteMemberResponse(
            success=True,
            message=f"User {invite_data.email} has been added to the organization",
            invitation_link=None
        )
    else:
        # TODO: Send invitation email to new user
        # For now, return a message that user needs to sign up first
        return InviteMemberResponse(
            success=False,
            message=f"User {invite_data.email} needs to sign up first. Ask them to create an account, then you can add them.",
            invitation_link=None
        )


@router.get("/{organization_id}/members", response_model=List[OrganizationMemberResponse])
async def list_organization_members(
    organization_id: int,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    List all members of an organization
    """
    # Check if user is member
    is_member = db.query(organization_members).filter(
        organization_members.c.organization_id == organization_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this organization"
        )
    
    # Get members with user details
    members = db.query(
        User.id,
        User.email,
        User.name,
        organization_members.c.role,
        organization_members.c.joined_at
    ).join(
        organization_members,
        User.id == organization_members.c.user_id
    ).filter(
        organization_members.c.organization_id == organization_id
    ).all()
    
    return [
        OrganizationMemberResponse(
            id=m.id,
            email=m.email,
            name=m.name,
            role=m.role,
            joined_at=m.joined_at
        )
        for m in members
    ]


@router.delete("/{organization_id}/members/{user_id}")
async def remove_organization_member(
    organization_id: int,
    user_id: int,
    current_user_id: int = 1,  # TODO: Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Remove a member from the organization
    Only admins can remove members (except themselves)
    """
    # Check if user is admin
    member = db.query(organization_members).filter(
        organization_members.c.organization_id == organization_id,
        organization_members.c.user_id == current_user_id
    ).first()
    
    if not member or member.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization admins can remove members"
        )
    
    # Prevent removing yourself if you're the last admin
    if user_id == current_user_id:
        admin_count = db.query(func.count(organization_members.c.user_id)).filter(
            organization_members.c.organization_id == organization_id,
            organization_members.c.role == "admin"
        ).scalar()
        
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove yourself as the last admin. Promote another member to admin first."
            )
    
    # Remove member
    result = db.execute(
        organization_members.delete().where(
            organization_members.c.organization_id == organization_id,
            organization_members.c.user_id == user_id
        )
    )
    
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in organization"
        )
    
    db.commit()
    
    return {"message": "Member removed successfully"}
