"""
Enhanced Database Models for AI QA Platform
Production-ready schema with organizations, requirements, test executions, and collaboration features
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table, JSON, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

# Enums for type safety
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    QA_ENGINEER = "qa_engineer"
    VIEWER = "viewer"

class RequirementType(str, enum.Enum):
    USER_STORY = "user_story"
    PRD = "prd"
    API_SPEC = "api_spec"
    FIGMA = "figma"
    OTHER = "other"

class TestCaseStatus(str, enum.Enum):
    DRAFT = "draft"
    READY = "ready"
    APPROVED = "approved"
    DEPRECATED = "deprecated"

class TestCasePriority(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TestCaseSeverity(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ExecutionStatus(str, enum.Enum):
    PASS = "pass"
    FAIL = "fail"
    BLOCKED = "blocked"
    SKIPPED = "skipped"

class AutomationType(str, enum.Enum):
    PLAYWRIGHT = "playwright"
    SELENIUM = "selenium"
    PYTEST = "pytest"
    CYPRESS = "cypress"

# Association table for organization members
organization_members = Table(
    'organization_members',
    Base.metadata,
    Column('organization_id', Integer, ForeignKey('organizations.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('role', String(50), default='qa_engineer'),
    Column('joined_at', DateTime, server_default=func.now())
)


class Organization(Base):
    """Organization model for multi-tenancy"""
    __tablename__ = 'organizations'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    
    # Subscription and limits
    subscription_plan = Column(String(50), default='free')  # free, pro, enterprise
    max_users = Column(Integer, default=5)
    max_projects = Column(Integer, default=3)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    members = relationship("User", secondary=organization_members, back_populates="organizations")
    projects = relationship("Project", back_populates="organization", cascade="all, delete-orphan")


class User(Base):
    """Enhanced User model with organization support"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    
    # Role and status
    role = Column(String(50), default='qa_engineer')  # admin, qa_engineer, viewer
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    organizations = relationship("Organization", secondary=organization_members, back_populates="members")
    projects = relationship("Project", back_populates="created_by_user")
    test_cases = relationship("TestCase", back_populates="created_by_user")
    assigned_test_cases = relationship("TestCase", foreign_keys="TestCase.assigned_to", back_populates="assigned_user")
    comments = relationship("Comment", back_populates="user")
    test_executions = relationship("TestExecution", back_populates="executed_by_user")


class Project(Base):
    """Enhanced Project model with organization context"""
    __tablename__ = 'projects'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default='active')  # active, archived, deleted
    
    # Organization reference
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="projects")
    created_by_user = relationship("User", back_populates="projects")
    requirements = relationship("Requirement", back_populates="project", cascade="all, delete-orphan")
    test_cases = relationship("TestCase", back_populates="project", cascade="all, delete-orphan")


class Requirement(Base):
    """Requirement management (User Stories, PRDs, etc.)"""
    __tablename__ = 'requirements'
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    requirement_type = Column(String(50), default='user_story')  # user_story, prd, api_spec, figma
    priority = Column(String(50), default='medium')  # critical, high, medium, low
    status = Column(String(50), default='active')  # active, completed, deprecated
    
    # External references
    external_id = Column(String(255), nullable=True)  # Jira ID, etc.
    external_url = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="requirements")
    test_cases = relationship("TestCase", back_populates="requirement")


class TestCase(Base):
    """Enhanced Test Case model with versioning and execution tracking"""
    __tablename__ = 'test_cases'
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    requirement_id = Column(Integer, ForeignKey('requirements.id'), nullable=True)
    
    # Versioning
    version_number = Column(Integer, default=1)
    previous_version_id = Column(Integer, ForeignKey('test_cases.id'), nullable=True)
    is_latest = Column(Boolean, default=True)
    
    # Core fields
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    steps = Column(Text, nullable=False)
    expected_result = Column(Text, nullable=False)
    
    # Classification
    priority = Column(String(50), default='medium')  # critical, high, medium, low
    severity = Column(String(50), default='medium')  # critical, high, medium, low
    status = Column(String(50), default='draft')  # draft, ready, approved, deprecated
    tags = Column(JSON, default=list)  # ["smoke", "regression", "api", "ui"]
    
    # Assignment
    assigned_to = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Automation
    automation_script_id = Column(Integer, ForeignKey('automation_scripts.id'), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="test_cases")
    requirement = relationship("Requirement", back_populates="test_cases")
    created_by_user = relationship("User", foreign_keys=[created_by], back_populates="test_cases")
    assigned_user = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_test_cases")
    executions = relationship("TestExecution", back_populates="test_case", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="test_case", cascade="all, delete-orphan")
    automation_script = relationship("AutomationScript", back_populates="test_case")
    previous_version = relationship("TestCase", remote_side=[id], backref="next_versions")


class TestExecution(Base):
    """Test execution tracking (Pass/Fail/Blocked)"""
    __tablename__ = 'test_executions'
    
    id = Column(Integer, primary_key=True, index=True)
    test_case_id = Column(Integer, ForeignKey('test_cases.id'), nullable=False)
    
    # Execution details
    status = Column(String(50), nullable=False)  # pass, fail, blocked, skipped
    comments = Column(Text, nullable=True)
    executed_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Environment info
    environment = Column(String(255), nullable=True)  # dev, staging, prod, etc.
    browser = Column(String(100), nullable=True)  # chrome, firefox, etc.
    version = Column(String(100), nullable=True)  # app version tested
    
    # Screenshot or attachment (optional)
    attachment_url = Column(String(500), nullable=True)
    
    # Timestamps
    executed_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    test_case = relationship("TestCase", back_populates="executions")
    executed_by_user = relationship("User", back_populates="test_executions")


class Comment(Base):
    """Comment system for collaboration on test cases"""
    __tablename__ = 'comments'
    
    id = Column(Integer, primary_key=True, index=True)
    test_case_id = Column(Integer, ForeignKey('test_cases.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    content = Column(Text, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    test_case = relationship("TestCase", back_populates="comments")
    user = relationship("User", back_populates="comments")


class AutomationScript(Base):
    """AI-generated automation scripts (Playwright, Selenium, etc.)"""
    __tablename__ = 'automation_scripts'
    
    id = Column(Integer, primary_key=True, index=True)
    test_case_id = Column(Integer, ForeignKey('test_cases.id'), nullable=False, unique=True)
    
    script_type = Column(String(50), nullable=False)  # playwright, selenium, pytest, cypress
    script_content = Column(Text, nullable=False)
    
    # AI metadata
    generated_by_ai = Column(Boolean, default=True)
    ai_model = Column(String(100), nullable=True)  # mistral-large, gpt-4, etc.
    
    # Status
    is_validated = Column(Boolean, default=False)
    last_executed = Column(DateTime, nullable=True)
    execution_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    test_case = relationship("TestCase", back_populates="automation_script")


# Keep backward compatibility with existing tables
class UserLegacy(Base):
    """Legacy User model for backward compatibility during migration"""
    __tablename__ = 'users_legacy'
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
