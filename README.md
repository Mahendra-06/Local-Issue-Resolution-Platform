# CivicPulse — Local Problem Reporting & Resolution Platform

CivicPulse connects citizens who report local municipal problems with department field staff who fix them, department managers who coordinate and verify work, and platform administrators who govern system operations.

---

## 📁 Repository Organization

```
d:/FSD-Project/
├── backend/                  # Complete CivicPulse Backend Application (Node/Express/MongoDB)
│   ├── .env.example          # Environment template (PORT, MONGODB_URI, JWT_SECRET, etc.)
│   ├── .env                  # Local backend configuration
│   ├── package.json          # Dependencies, scripts (start, dev, seed, test)
│   ├── uploads/              # Static file upload directory
│   ├── scripts/
│   │   ├── seed.js           # Optional development baseline database seed
│   │   └── verify_e2e.js     # Full end-to-end API lifecycle verification script
│   ├── tests/
│   │   └── api.test.js       # Automated integration test suite
│   └── src/
│       ├── config/           # Database connection & environment configuration
│       ├── models/           # Mongoose schemas (User, Incident, Assignment, Department, etc.)
│       ├── validators/       # Zod request validation schemas
│       ├── middleware/       # JWT auth, RBAC guards, Multer upload, error handling
│       ├── services/         # Business logic & aggregation services
│       ├── controllers/      # Express request/response handlers
│       ├── routes/           # REST endpoint routers
│       ├── utils/            # Reference IDs, audit logger, API response wrappers
│       ├── app.js            # Express app configuration & middleware
│       └── server.js         # Server bootstrap & graceful shutdown
├── frontend/                 # Complete CivicPulse Frontend Application (React/Tailwind)
│   ├── .env.example          # Environment template (VITE_API_BASE_URL, etc.)
│   ├── .env                  # Local frontend configuration
│   ├── package.json          # Dependencies & npm scripts
│   ├── vite.config.js        # Vite + Tailwind CSS v4 setup
│   ├── index.html            # Entry HTML & typography links
│   └── src/                  # Components, pages, context, and API services
└── README.md                 # Root project documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18 or later (tested on v25.0.0)
- **MongoDB**: Local MongoDB instance on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
npm install

# Setup environment
cp .env.example .env

# (Optional) Seed development accounts and initial baseline data
npm run seed

# Run automated test suite
npm test

# Start backend server
npm start
# Server starts on: http://localhost:5000/
# API base: http://localhost:5000/api
# Health check: http://localhost:5000/api/health
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start frontend development server
npm run dev
# Frontend starts on: http://127.0.0.1:5173/
```

---

## 🔐 Default Seeded Credentials

When running `npm run seed` in `backend/`, the following demonstration accounts are created:

| Role | Email | Password | Home Path |
|---|---|---|---|
| **Citizen** | `citizen@civicpulse.gov` | `Citizen123!` | `/citizen` |
| **Department Staff** | `staff@civicpulse.gov` | `Staff123!` | `/staff` |
| **Department Manager** | `manager@civicpulse.gov` | `Manager123!` | `/manager` |
| **Administrator** | `admin@civicpulse.gov` | `Admin123!` | `/admin` |
