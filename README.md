# AI-Powered QA Test Case Management Platform

A production-ready MVP for an AI-powered platform that helps QA teams generate, manage, and export test cases using advanced AI technology.
<img width="1512" height="825" alt="image" src="https://github.com/user-attachments/assets/223dfc7f-7d5a-45e7-8a82-839990e5046e" />

<img width="1512" height="825" alt="image" src="https://github.com/user-attachments/assets/076bc03f-64fc-4c05-b7bd-bae74838d0b4" />

## 🎯 Features

- **AI-Powered Test Case Generation**: Generate comprehensive test cases using OpenAI GPT-4 or Claude API
- **Project Management**: Create and manage multiple projects
- **Test Case Management**: Edit, filter, and organize test cases with priority and status tracking
- **Excel Export**: Export test cases to formatted Excel files
- **Modern UI**: Clean, responsive SaaS-style interface built with Next.js and Tailwind CSS
- **Real-time Updates**: Live editing and updates to test cases

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Python
- **Database**: SQLite (easily scalable to PostgreSQL)
- **AI Integration**: OpenAI GPT-4 / Claude API
- **Export**: pandas + openpyxl for Excel generation

### Frontend (Next.js)
- **Framework**: Next.js 14 with React
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **API Integration**: Axios with async/await

## 📁 Project Structure

```
ai-qa-platform/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── models/
│   │   ├── database.py         # SQLAlchemy database models
│   │   └── schemas.py          # Pydantic data models
│   ├── routes/
│   │   ├── projects.py         # Project management endpoints
│   │   ├── testcases.py        # Test case CRUD operations
│   │   ├── ai.py              # AI test case generation
│   │   └── export.py          # Excel export functionality
│   ├── services/
│   │   ├── ai_service.py      # AI API integration
│   │   └── excel_service.py   # Excel export service
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/
│   ├── pages/
│   │   ├── index.jsx          # Dashboard page
│   │   └── project/
│   │       └── [id].jsx       # Project detail page
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   ├── services/
│   │   └── api.js             # API client
│   ├── styles/
│   │   └── globals.css        # Global styles
│   ├── package.json           # Node.js dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── next.config.js         # Next.js configuration
│   └── .env.local.example     # Environment variables template
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### 1. Clone and Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env

# Edit .env file and add your AI API key
# Choose either OpenAI or Anthropic:
# OPENAI_API_KEY=your_openai_api_key_here
# or
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 2. Start Backend Server

```bash
# Run the FastAPI server
python main.py

# The server will start on http://localhost:8000
# API documentation available at http://localhost:8000/docs
```

### 3. Setup and Start Frontend

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local

# Start development server
npm run dev

# The frontend will start on http://localhost:3000
```

## 📖 Usage Guide

### 1. Create a Project
- Navigate to the Dashboard (http://localhost:3000)
- Click "New Project"
- Enter project name and description
- Click "Create Project"

### 2. Generate Test Cases
- Click on a project to view its details
- Click "Generate Test Cases"
- Enter the feature name and requirement description
- Click "Generate Test Cases" - AI will create comprehensive test cases

### 3. Manage Test Cases
- **Edit**: Click "Edit" on any test case to modify it inline
- **Filter**: Use priority and status filters to find specific test cases
- **Delete**: Remove unwanted test cases with the delete button
- **Export**: Click "Export to Excel" to download all test cases

### 4. Test Case Structure
Each test case includes:
- **Title**: Clear, descriptive test case name
- **Steps**: Detailed test execution steps
- **Expected Result**: Specific expected outcomes
- **Priority**: Low, Medium, High, or Critical
- **Status**: Draft, Ready, Approved, or Deprecated

## 🔧 Configuration

### AI API Setup

#### OpenAI GPT-4
```bash
# In backend/.env
OPENAI_API_KEY=sk-your-openai-api-key
```

#### Anthropic Claude
```bash
# In backend/.env
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
```

### Database Configuration

The platform uses SQLite by default. To switch to PostgreSQL:

1. Install PostgreSQL adapter:
```bash
pip install psycopg2-binary
```

2. Update database URL in `backend/models/database.py`:
```python
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/qa_platform"
```

## 📚 API Endpoints

### Projects
- `GET /projects/` - List all projects
- `POST /projects/` - Create new project
- `GET /projects/{id}` - Get specific project

### Test Cases
- `GET /testcases/project/{project_id}` - Get test cases for project
- `PUT /testcases/{id}` - Update test case
- `DELETE /testcases/{id}` - Delete test case

### AI
- `POST /ai/generate-testcases` - Generate test cases using AI

### Export
- `POST /export/excel` - Export test cases to Excel

## 🎨 UI Components

The platform includes a reusable component library:

- **Button**: Multiple variants (primary, secondary, outline, destructive)
- **Input**: Form inputs with validation
- **TextArea**: Multi-line text inputs
- **Card**: Container components
- **Modal**: Overlay dialogs

## 🔒 Security Considerations

- API keys should be kept secure and never committed to version control
- The MVP uses basic authentication (expandable to JWT)
- Input validation on all API endpoints
- SQL injection prevention through SQLAlchemy ORM

## 🚀 Production Deployment

### Backend Deployment
```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables for Production
- Use proper secret management
- Set `NODE_ENV=production`
- Configure proper database connections
- Set up CORS for your domain

## 🐛 Troubleshooting

### Common Issues

1. **AI API Errors**
   - Check API key is correctly set in `.env`
   - Verify API key has sufficient credits
   - Check network connectivity

2. **Database Issues**
   - Ensure `qa_platform.db` file has write permissions
   - Delete database file to reset (development only)

3. **Frontend Connection Issues**
   - Ensure backend is running on port 8000
   - Check CORS configuration in `main.py`

4. **Excel Export Issues**
   - Verify pandas and openpyxl are installed
   - Check test cases exist before exporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation at `http://localhost:8000/docs`
3. Check browser console for frontend errors
4. Review backend logs for API errors

---

**Built with ❤️ using FastAPI, Next.js, and modern AI technologies**
