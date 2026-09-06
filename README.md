# 📝 NoteKeeper

> A full-stack, production-grade personal notes management platform built with **FastAPI** (Python 3.11+) and **React** (Vite + Tailwind CSS).

---

## 🌟 Features

- **Authentication & Security**:
  - Secure user registration and login with bcrypt password hashing.
  - JWT token-based authentication with 24-hour access tokens and 7-day refresh tokens.
  - Ownership enforcement: users can only view, edit, and delete their own notes.
- **Note Management (CRUD)**:
  - Create notes with custom color coding, rich content, categories, tags, and date reminders.
  - Instant favorite toggle and star filtering.
  - Filter notes by category or tags.
  - Instant full-text search across titles and content.
  - Multi-select batch deletion.
  - Configurable sorting (`created_at`, `title`, `updated_at`) and pagination.
- **Category Management**:
  - Custom categories with custom color badges and icons.
  - Cascade support: notes remain safely intact when categories are deleted.
- **API Documentation**:
  - Interactive Swagger UI documentation at `/docs`.
  - Structured error formats matching enterprise standards.
- **Deployment Ready**:
  - Backend prepared for cloud hosting (Render, Railway, Fly.io, FastAPI Cloud).
  - Frontend configured for one-click deployment on **Vercel** with SPA rewrites.

---

## 🏗️ Project Structure

```
NoteKeeper/
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/routes/        # Auth, Notes, and Categories routes
│   │   ├── core/                 # Config, Database, Security, Pagination, Dependencies
│   │   ├── models/               # SQLAlchemy models (User, Note, Category)
│   │   ├── repositories/         # Database query & data access layer
│   │   ├── schemas/              # Pydantic v2 schemas and validation
│   │   ├── services/             # Business logic layer
│   │   ├── utils/                # Custom exceptions and validators
│   │   └── main.py               # FastAPI entrypoint & middleware
│   ├── tests/                    # Pytest automated test suite (19 test cases)
│   ├── docker/                   # Dockerfile & compose for backend
│   ├── Dockerfile                # Production Dockerfile
│   ├── Procfile                  # Cloud process file
│   ├── render.yaml               # Render blueprint configuration
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Environment template
│
├── frontend/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, NoteCard, NoteModal, etc.
│   │   ├── context/              # AuthContext (state & session persistence)
│   │   ├── pages/                # LoginPage, RegisterPage, DashboardPage
│   │   ├── services/             # Axios API client with token interceptors & auto-refresh
│   │   ├── App.jsx               # Root application router
│   │   └── main.jsx
│   ├── vercel.json               # Vercel deployment configuration (SPA routing)
│   ├── tailwind.config.js        # Tailwind CSS styling
│   ├── vite.config.js            # Vite build configuration
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml            # Multi-service local orchestration
└── README.md
```

---

## 🚀 Local Development Quickstart

### Prerequisites
- **Python 3.10+** (Python 3.11 recommended)
- **Node.js 18+** & **npm**

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
copy .env.example .env     # Windows
# cp .env.example .env     # Linux/macOS

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

- Backend API: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

#### Running Backend Tests:
```bash
pytest
```

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

- Frontend App: `http://localhost:5173`
- Default API Proxy routes `/api` requests to `http://127.0.0.1:8000`.

---

## ☁️ Deployment Guide

### Part A: Deploy Backend to Cloud (Render / Railway / FastAPI Cloud)

#### Option 1: Deploy to Render (Recommended Free & Fast)
1. Push your code to a **GitHub** repository.
2. Go to [Render.com](https://render.com) and create a free account.
3. Click **New +** → **Web Service** and connect your GitHub repository.
4. Set the following configuration:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. In **Environment Variables**, add:
   - `JWT_SECRET_KEY`: `(click Generate or enter a random 32+ character string)`
   - `JWT_REFRESH_SECRET_KEY`: `(click Generate or enter a random 32+ character string)`
   - `ENVIRONMENT`: `production`
   - `DEBUG`: `false`
   - `CORS_ORIGINS`: `["*"]` *(or your Vercel frontend URL once deployed)*
   - `DATABASE_URL`: `sqlite:///./notekeeper.db` *(or connect a free Render PostgreSQL database)*
6. Click **Create Web Service**.
7. Once deployed, copy your backend URL:
   `https://notekeeper-api.onrender.com`

---

### Part B: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign in.
2. Click **Add New...** → **Project**.
3. Import your **NoteKeeper** GitHub repository.
4. In the project configuration screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend`.
5. Expand the **Environment Variables** section and add:
   - `VITE_API_BASE_URL` = `https://your-backend-api.onrender.com/api/v1`
   *(Replace with your actual backend URL from Part A)*
6. Click **Deploy**!
7. Vercel will automatically build the React app and deploy it globally with SPA routing supported via [`frontend/vercel.json`](file:///frontend/vercel.json).

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/auth/register` | Register a new user | No |
| `POST` | `/api/v1/auth/login` | Authenticate & get tokens | No |
| `POST` | `/api/v1/auth/refresh` | Refresh access token | No (Refresh Token) |
| `POST` | `/api/v1/auth/logout` | Logout user | Yes |
| `GET` | `/api/v1/auth/me` | Get current user profile | Yes |
| `POST` | `/api/v1/notes/` | Create a note | Yes |
| `GET` | `/api/v1/notes/` | List notes with pagination, search, tags, categories | Yes |
| `GET` | `/api/v1/notes/{id}` | Retrieve a specific note | Yes |
| `PATCH` | `/api/v1/notes/{id}` | Partially update note | Yes |
| `DELETE` | `/api/v1/notes/{id}` | Delete note | Yes |
| `POST` | `/api/v1/notes/batch` | Batch delete multiple notes | Yes |
| `POST` | `/api/v1/categories/` | Create category | Yes |
| `GET` | `/api/v1/categories/` | List all user categories | Yes |
| `PATCH` | `/api/v1/categories/{id}` | Update category | Yes |
| `DELETE` | `/api/v1/categories/{id}` | Delete category | Yes |
| `GET` | `/health` | Service health status | No |
| `GET` | `/docs` | Interactive Swagger UI | No |

---

## 🛡️ Security Best Practices Implemented

- Secure password hashing using pure `bcrypt` with unique salts.
- Short-lived JWT access tokens + rotating refresh tokens.
- Complete user data isolation preventing horizontal privilege escalation.
- Strict input validation via Pydantic schemas.
- CORS restricted to authenticated origins in production.
- Standardized error handling preventing internal stack trace leakage.
