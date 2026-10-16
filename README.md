# CivicPulse — Municipal Problem Reporting & Resolution Platform

CivicPulse is a full-stack, role-based civic infrastructure platform that connects **Citizens** reporting local issues with **Department Field Staff** executing repairs, **Department Managers** supervising assignments, and **Platform Administrators** overseeing municipal governance, SLAs, and immutable audit logs.

[![Live Frontend](https://img.shields.io/badge/Vercel-Frontend%20Live-black?style=flat&logo=vercel)](https://local-issue-resolution-platform.vercel.app)
[![Live Backend](https://img.shields.io/badge/Render-Backend%20API-46E3B7?style=flat&logo=render)](https://local-issue-resolution-platform-9bra.onrender.com/api/health)
[![Database](https://img.shields.io/badge/MongoDB-Atlas%20Cloud-green?style=flat&logo=mongodb)](https://www.mongodb.com/atlas)

---

## 🌐 Live Deployments

| Component | Platform | URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | Vercel | [local-issue-resolution-platform.vercel.app](https://local-issue-resolution-platform.vercel.app) | `Active` |
| **Backend REST API** | Render | [local-issue-resolution-platform-9bra.onrender.com](https://local-issue-resolution-platform-9bra.onrender.com) | `Active` |
| **API Health Check** | Render | [local-issue-resolution-platform-9bra.onrender.com/api/health](https://local-issue-resolution-platform-9bra.onrender.com/api/health) | `200 OK` |

---

## 🏗️ Architecture & Core Workflows

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CivicPulse Client (Vercel)                      │
│      React 19 • Vite • Tailwind CSS • React-Leaflet • Lucide Icons     │
└───────────────┬────────────────────────────────────────┬───────────────┘
                │ REST API (Bearer JWT)                  │ Road Geometry & Tiles
                ▼                                        ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       CivicPulse Backend (Render)    │  │  OpenStreetMap & OSRM Engine │
│  Express • Mongoose • Zod • Multer   │  │  • Driving Routes & Distance │
└───────────────┬──────────────────────┘  │  • Nominatim Geocoding       │
                │ Mongoose ODM            └──────────────────────────────┘
                ▼
┌──────────────────────────────────────┐
│         MongoDB Atlas (Cloud)        │
│  Users • Incidents • Assignments     │
│  Departments • Categories • Audits   │
└──────────────────────────────────────┘
```

### Role-Based Access Control (RBAC)

1. **Citizen Portal (`/citizen`)**:
   - Report local problems with photos, GPS coordinates, and category tags.
   - Interactive OpenStreetMap location picker with address reverse-geocoding.
   - Real-time status tracker (*Reported → Under Review → Assigned → In Progress → Verified & Resolved*).
   - Citizen notifications for workflow updates.

2. **Department Staff Console (`/staff`)**:
   - Inspect assigned work orders with severity, deadlines, and instructions.
   - Field map with OSRM driving routes, distance calculations, and estimated travel durations.
   - Work status progression (*In Progress → Submit Verification Evidence*).
   - Upload field repair verification photos and work notes.

3. **Department Manager Console (`/manager`)**:
   - Supervise department incidents across municipal wards.
   - Assign tasks to available field technicians with custom priority and deadlines.
   - Review incoming field completions in the verification queue.
   - Approve resolutions or return tasks for rework.

4. **Platform Administrator Hub (`/admin`)**:
   - City-wide platform metrics and SLA compliance velocity.
   - User credential management, role upgrades, and active account toggles.
   - Configure municipal departments and service boundaries.
   - Maintain problem taxonomy, default routing departments, and SLA target hours.
   - Immutable security audit logs recording all authentication and system actions.

---

## 🛠️ Technology Stack

- **Frontend**:
  - **Framework**: React 19, Vite
  - **Styling**: Tailwind CSS, Glassmorphism design tokens
  - **Mapping & GIS**: Leaflet, React-Leaflet, OpenStreetMap
  - **Routing Engine**: OSRM (Open Source Routing Machine API v5)
  - **Icons & Visuals**: Lucide React, Recharts (Admin & Manager Analytics)
- **Backend**:
  - **Runtime**: Node.js (ES Modules)
  - **Server**: Express 4
  - **Database**: MongoDB Atlas via Mongoose 8
  - **Validation**: Zod schema validation middleware
  - **Security**: JWT Authentication, Bcrypt password hashing, Helmet, CORS, Audit Logging
  - **File Handling**: Multer for incident evidence photos

---

## 📁 Repository Structure

```text
d:/FSD-Project/
├── backend/                         # Express & Mongoose API Server
│   ├── src/
│   │   ├── config/                  # MongoDB Atlas connection & environment loader
│   │   ├── controllers/             # HTTP controllers for all domain routes
│   │   ├── middleware/              # JWT auth, RBAC guards, Zod validator, Multer
│   │   ├── models/                  # Mongoose models (User, Incident, Department, etc.)
│   │   ├── routes/                  # Express REST routers
│   │   ├── services/                # Business logic, analytics aggregations, audit logs
│   │   ├── utils/                   # ApiResponse, reference code generators
│   │   ├── validators/              # Zod validation schemas
│   │   ├── app.js                   # Express application setup, CORS & middleware
│   │   └── server.js                # Server entry point & graceful shutdown
│   ├── scripts/
│   │   ├── create_admin.js          # CLI administrator provisioning script
│   │   └── verify_e2e.js            # Automated E2E verification script
│   ├── tests/                       # Integration test suite (Node test runner)
│   ├── .env.example                 # Environment template for backend
│   └── package.json                 # Backend dependencies and scripts
│
├── frontend/                        # Vite & React Single-Page Application
│   ├── src/
│   │   ├── api/                     # Centralized API client & domain services
│   │   ├── components/              # Reusable UI cards, maps, navigation, and forms
│   │   ├── constants/               # Roles, permissions, themes, and configuration
│   │   ├── context/                 # AuthContext (JWT session) & ToastContext
│   │   ├── pages/                   # Citizen, Staff, Manager, Admin, and Auth views
│   │   ├── routes/                  # AppRoutes and ProtectedRoute RBAC guards
│   │   └── utils/                   # Leaflet marker icons, formatters, and helpers
│   ├── public/                      # Static assets
│   ├── vercel.json                  # Vercel SPA routing rewrite configuration
│   ├── .env.example                 # Environment template for frontend
│   └── package.json                 # Frontend dependencies and scripts
│
└── README.md                        # Project documentation
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (tested on Node v25)
- **MongoDB**: Active MongoDB Atlas cloud URI or local MongoDB instance

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and supply your MONGODB_URI and JWT_SECRET

# Provision your initial Platform Administrator account
node scripts/create_admin.js "Platform Administrator" "admin@civicpulse.gov" "Admin123!"

# Run automated tests
npm test

# Start backend dev server
npm run dev
# Server running at: http://localhost:5000
# Health endpoint: http://localhost:5000/api/health
```

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Ensure VITE_API_BASE_URL=http://localhost:5000/api

# Start frontend dev server
npm run dev
# Client accessible at: http://localhost:5173
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | HTTP port for server | `5000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://<user>:<pwd>@cluster0...` |
| `JWT_SECRET` | Secret key for signing session tokens | `civicpulse_secure_jwt_secret_2026` |
| `JWT_EXPIRES_IN` | JWT token lifetime | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:5173,https://<app>.vercel.app` |
| `BASE_URL` | Canonical server base URL | `http://localhost:5000` |
| `UPLOAD_DIR` | Directory for uploaded images | `uploads` |
| `MAX_FILE_SIZE_MB` | Upload file size limit in MB | `10` |
| `STAFF_INVITE_CODE`| Verification code for Staff registration | `STAFF-AUTH-2026` |
| `MANAGER_INVITE_CODE`| Verification code for Manager registration | `MGR-AUTH-2026` |

### Frontend (`frontend/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend API base URL | `https://local-issue-resolution-platform-9bra.onrender.com/api` |
| `VITE_OSRM_ROUTING_URL`| OSRM driving routing endpoint | `https://router.project-osrm.org` |
| `VITE_NOMINATIM_URL` | OpenStreetMap geocoding endpoint | `https://nominatim.openstreetmap.org` |

---

## ☁️ Deployment Guide

### Deploy Backend to Render
1. Create a **Web Service** on [Render](https://dashboard.render.com/) linked to your repository.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add the **Environment Variables** listed above (`NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, etc.).
4. Set `CORS_ORIGIN` to your Vercel frontend URL.

### Deploy Frontend to Vercel
1. Import the repository in [Vercel](https://vercel.com/).
2. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add `VITE_API_BASE_URL` pointing to your Render backend with `/api` at the end:
   `https://<your-render-app>.onrender.com/api`
4. Deploy. The included `frontend/vercel.json` ensures all client-side routes (`/admin`, `/login`, etc.) rewrite to `index.html`.

---

## 🗺️ OSRM & Leaflet Integration

CivicPulse uses the **Open Source Routing Machine (OSRM)** and **Leaflet** to empower field technicians with real-time turn-by-turn road routes:

- **Coordinate System**: Translates between OSRM's `{longitude},{latitude}` convention and Leaflet's `[latitude, longitude]` requirement.
- **Polyline Rendering**: Draws road-following driving paths with estimated distance and travel durations.
- **Reverse Geocoding**: Translates GPS pins into municipal street addresses using OpenStreetMap Nominatim with in-memory caching.

---

## 🔒 Security & Authentication Highlights

- **Stateless JWT Sessions**: Authoritative user roles are verified by backend middleware on every protected request.
- **Role Isolation**: Strict role boundary enforcement prevents privilege escalation.
- **Race-Condition Proof**: In-flight token validation prevents session invalidation on rapid route transitions.
- **Audit Logging**: All logins, logouts, role updates, and assignment dispatches are immutably logged to the database.

---

## 📄 License

This project is licensed under the **ISC License**.
