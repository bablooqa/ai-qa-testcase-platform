from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from models.database import create_tables
from routes import projects, testcases, ai, export
from routes import organizations, requirements, executions, comments, ai_enhanced

# Debug: Print API key status (first 10 chars only for security)
api_key = os.getenv("MISTRAL_API_KEY")
if api_key:
    print(f"✅ MISTRAL_API_KEY loaded: {api_key[:10]}...")
else:
    print("❌ MISTRAL_API_KEY not found in environment")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    create_tables()
    yield

# Create FastAPI app
app = FastAPI(
    title="AI QA Test Case Management Platform",
    description="AI-powered platform for generating and managing test cases",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(projects.router)
app.include_router(testcases.router)
app.include_router(ai.router)
app.include_router(export.router)
app.include_router(organizations.router)
app.include_router(requirements.router)
app.include_router(executions.router)
app.include_router(comments.router)
app.include_router(ai_enhanced.router)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AI QA Test Case Management Platform API"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)