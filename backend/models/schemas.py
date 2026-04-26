from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str
    role: str = "qa_engineer"

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Project(ProjectBase):
    id: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True

class TestCaseBase(BaseModel):
    title: str
    steps: str
    expected_result: str
    priority: str = "medium"
    status: str = "draft"

class TestCaseCreate(TestCaseBase):
    project_id: int

class TestCase(TestCaseBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class GenerateTestCaseRequest(BaseModel):
    requirement: str
    feature_name: str
    project_id: int

class ExportRequest(BaseModel):
    project_id: int

class AddMemberRequest(BaseModel):
    name: str
    email: str
    role: str = "qa_engineer"