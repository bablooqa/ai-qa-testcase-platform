"""
Pydantic Schemas for Enhanced AI QA Platform
Validation schemas for API requests and responses
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    QA_ENGINEER = "qa_engineer"
    VIEWER = "viewer"


class RequirementType(str, Enum):
    USER_STORY = "user_story"
    PRD = "prd"
    API_SPEC = "api_spec"
    FIGMA = "figma"
    OTHER = "other"


class TestCaseStatus(str, Enum):
    DRAFT = "draft"
    READY = "ready"
    APPROVED = "approved"
    DEPRECATED = "deprecated"


class TestCasePriority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TestCaseSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ExecutionStatus(str, Enum):
    PASS = "pass"
    FAIL = "fail"
    BLOCKED = "blocked"
    SKIPPED = "skipped"


class AutomationType(str, Enum):
    PLAYWRIGHT = "playwright"
    SELENIUM = "selenium"
    PYTEST = "pytest"
    CYPRESS = "cypress"


# ============= ORGANIZATION SCHEMAS =============

class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    logo_url: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    logo_url: Optional[str] = None


class OrganizationResponse(OrganizationBase):
    id: int
    slug: str
    subscription_plan: str
    max_users: int
    max_projects: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class OrganizationMemberResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    joined_at: datetime
    
    class Config:
        from_attributes = True


# ============= USER SCHEMAS =============

class UserBase(BaseModel):
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    name: str = Field(..., min_length=1, max_length=255)
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.QA_ENGINEER


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar_url: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    last_login: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ============= PROJECT SCHEMAS =============

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    organization_id: int


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: int
    status: str
    organization_id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    test_case_count: Optional[int] = 0
    requirement_count: Optional[int] = 0
    
    class Config:
        from_attributes = True


# ============= REQUIREMENT SCHEMAS =============

class RequirementBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    requirement_type: RequirementType = RequirementType.USER_STORY
    priority: TestCasePriority = TestCasePriority.MEDIUM
    status: str = "active"
    external_id: Optional[str] = None
    external_url: Optional[str] = None


class RequirementCreate(RequirementBase):
    project_id: int


class RequirementUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    requirement_type: Optional[RequirementType] = None
    priority: Optional[TestCasePriority] = None
    status: Optional[str] = None
    external_id: Optional[str] = None
    external_url: Optional[str] = None


class RequirementResponse(RequirementBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    test_case_count: Optional[int] = 0
    
    class Config:
        from_attributes = True


# ============= TEST CASE SCHEMAS =============

class TestCaseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    steps: str = Field(..., min_length=1)
    expected_result: str = Field(..., min_length=1)
    priority: TestCasePriority = TestCasePriority.MEDIUM
    severity: TestCaseSeverity = TestCaseSeverity.MEDIUM
    status: TestCaseStatus = TestCaseStatus.DRAFT
    tags: List[str] = []


class TestCaseCreate(TestCaseBase):
    project_id: int
    requirement_id: Optional[int] = None
    assigned_to: Optional[int] = None


class TestCaseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    steps: Optional[str] = Field(None, min_length=1)
    expected_result: Optional[str] = Field(None, min_length=1)
    priority: Optional[TestCasePriority] = None
    severity: Optional[TestCaseSeverity] = None
    status: Optional[TestCaseStatus] = None
    tags: Optional[List[str]] = None
    assigned_to: Optional[int] = None


class TestCaseResponse(TestCaseBase):
    id: int
    project_id: int
    requirement_id: Optional[int]
    version_number: int
    is_latest: bool
    assigned_to: Optional[int]
    assigned_user_name: Optional[str] = None
    created_by: int
    created_by_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_execution_status: Optional[str] = None
    automation_script_id: Optional[int] = None
    
    class Config:
        from_attributes = True


class TestCaseListResponse(BaseModel):
    items: List[TestCaseResponse]
    total: int
    page: int
    page_size: int


class TestCaseFilter(BaseModel):
    project_id: Optional[int] = None
    requirement_id: Optional[int] = None
    status: Optional[TestCaseStatus] = None
    priority: Optional[TestCasePriority] = None
    assigned_to: Optional[int] = None
    tags: Optional[List[str]] = None
    search: Optional[str] = None


# ============= TEST EXECUTION SCHEMAS =============

class TestExecutionBase(BaseModel):
    status: ExecutionStatus
    comments: Optional[str] = None
    environment: Optional[str] = None
    browser: Optional[str] = None
    version: Optional[str] = None
    attachment_url: Optional[str] = None


class TestExecutionCreate(TestExecutionBase):
    test_case_id: int


class TestExecutionResponse(TestExecutionBase):
    id: int
    test_case_id: int
    executed_by: int
    executed_by_name: Optional[str] = None
    executed_at: datetime
    
    class Config:
        from_attributes = True


class ExecutionStats(BaseModel):
    total_executions: int
    pass_count: int
    fail_count: int
    blocked_count: int
    skipped_count: int
    pass_rate: float


# ============= COMMENT SCHEMAS =============

class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)


class CommentCreate(CommentBase):
    test_case_id: int


class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1)


class CommentResponse(CommentBase):
    id: int
    test_case_id: int
    user_id: int
    user_name: str
    user_avatar: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============= AUTOMATION SCRIPT SCHEMAS =============

class AutomationScriptBase(BaseModel):
    script_type: AutomationType
    script_content: str = Field(..., min_length=1)


class AutomationScriptCreate(AutomationScriptBase):
    test_case_id: int


class AutomationScriptGenerate(BaseModel):
    test_case_id: int
    script_type: AutomationType


class AutomationScriptResponse(AutomationScriptBase):
    id: int
    test_case_id: int
    generated_by_ai: bool
    ai_model: Optional[str]
    is_validated: bool
    last_executed: Optional[datetime]
    execution_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============= AI GENERATION SCHEMAS =============

class GenerateTestCasesRequest(BaseModel):
    project_id: int
    requirement_id: Optional[int] = None
    feature_name: str = Field(..., min_length=1, max_length=255)
    requirement_description: str = Field(..., min_length=10)
    additional_context: Optional[str] = None


class GenerateTestCasesResponse(BaseModel):
    generated_count: int
    test_cases: List[TestCaseResponse]


class ImproveTestCasesRequest(BaseModel):
    project_id: int
    test_case_ids: Optional[List[int]] = None  # If None, analyze all test cases in project


class ImprovementSuggestion(BaseModel):
    test_case_id: int
    test_case_title: str
    suggestion_type: str  # missing_edge_case, duplicate, weak_coverage, unclear_steps
    description: str
    recommended_action: str


class ImproveTestCasesResponse(BaseModel):
    suggestions: List[ImprovementSuggestion]
    total_suggestions: int
    critical_issues: int
    warnings: int
    recommendations: int


# ============= EXPORT SCHEMAS =============

class ExportRequest(BaseModel):
    project_id: int
    test_case_ids: Optional[List[int]] = None  # If None, export all
    format: str = "excel"  # excel, json, csv


class ExportResponse(BaseModel):
    download_url: str
    file_name: str
    format: str
    exported_count: int


# ============= DASHBOARD SCHEMAS =============

class DashboardStats(BaseModel):
    total_projects: int
    total_test_cases: int
    total_requirements: int
    total_executions: int
    
    # Test case breakdown
    test_cases_by_status: Dict[str, int]
    test_cases_by_priority: Dict[str, int]
    
    # Execution stats
    executions_today: int
    executions_this_week: int
    executions_this_month: int
    
    # Coverage metrics
    automation_coverage_percent: float
    requirements_coverage_percent: float
    
    # Recent activity
    recent_executions: List[TestExecutionResponse]
    recently_updated_test_cases: List[TestCaseResponse]


class TestCoverageMetrics(BaseModel):
    total_requirements: int
    requirements_with_test_cases: int
    requirements_without_test_cases: int
    coverage_percent: float
    
    # Detailed breakdown
    coverage_by_priority: Dict[str, Dict[str, Any]]


# ============= INVITATION SCHEMAS =============

class InviteMemberRequest(BaseModel):
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    role: UserRole = UserRole.QA_ENGINEER
    organization_id: int


class InviteMemberResponse(BaseModel):
    success: bool
    message: str
    invitation_link: Optional[str] = None
