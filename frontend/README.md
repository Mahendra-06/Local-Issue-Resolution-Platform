# CivicPulse — Local Problem Reporting & Resolution Platform

**CivicPulse** is a responsive, modern municipal governance and civic issue resolution platform. Built with React.js, Tailwind CSS (with Medium Glassmorphism), and Lucide React, it connects citizens who report local infrastructure problems with department field staff who fix them, department managers who coordinate and verify work, and platform administrators who govern system operations.

---

## 🏛️ Application Workflow & Role Mapping

The platform implements the 4 core roles defined in the **CivicPulse Workflow Diagram**:

```
+-------------+
|  Login Page | ---> Select role context / authenticated backend verification
+-------------+
       |
       +---> [1] Citizen Dashboard: Submit Report, View My Reports, Explore Issues, Track Progress & Notifications
       |
       +---> [3] Department Manager Dashboard: Review Incidents, Assign/Reassign Work, Monitor Progress, Verify Resolution or Reopen
       |             |                                                                ^
       |             v (Assign with instructions & due date)                          | (Work Update / Evidence)
       +---> [2] Department Staff Dashboard: View Assigned Issues, Manage Work, Update Status & Upload Evidence
       |             |
       |             +----------------------------------------------------------------+
       |
       +---> [4] Administrator Dashboard: Manage Users, Departments, Categories, Platform Analytics, Audit History, Settings
```

---

## 🎨 Design System: Medium Glassmorphism

- **Visual Balance**: 70% solid white or neutral surfaces (`#F8F7FC`), 20% lightly tinted/translucent panels, 10% gradient highlights.
- **Shared Design Tokens**:
  - Page Background: `#F8F7FC`
  - Primary Text: `#252238`
  - Secondary Text: `#6B687A`
  - Card Radius: `12–18px` (`rounded-2xl`)
- **Role-Specific Theme Palettes**:
  - **Citizen**: Lavender & Rose (Primary: `#7C3AED`, Secondary: `#DB2777`, Background: `#F5F0FF`)
  - **Department Staff**: Peach & Amber (Primary: `#C2410C`, Secondary: `#D97706`, Background: `#FFF7ED`)
  - **Department Manager**: Teal & Mint (Primary: `#0F766E`, Secondary: `#65A30D`, Background: `#ECFDF5`)
  - **Administrator**: Indigo & Violet (Primary: `#4338CA`, Secondary: `#8B5CF6`, Background: `#EEF2FF`)
- **Shared Status Badges**:
  - `Reported`: Purple / Neutral
  - `Under Review`: Indigo
  - `Assigned`: Blue
  - `In Progress`: Amber
  - `Pending Verification`: Violet
  - `Resolved`: Green
  - `Overdue` / `Rejected`: Red

---

## 🚀 Technology Stack

- **Core**: React.js with functional components and hooks
- **Language**: JavaScript ES6+ (no TypeScript)
- **Styling**: Tailwind CSS v4 + Medium Glassmorphism
- **Navigation**: React Router v7 (`react-router-dom`)
- **Networking**: Centralized fetch API client with error handling & JWT injection
- **Icons**: Lucide React
- **Visualizations**: Recharts
- **Mapping**: Dynamic MapContainer (Google Maps Platform when configured; accessible SVG coordinate grid fallback)

---

## 🛠️ Project Structure

```
d:/FSD-Project/
├── .env.example              # Documented environment variables
├── .env                      # Local environment settings
├── package.json              # Project dependencies & scripts
├── vite.config.js            # Vite configuration with Tailwind CSS v4
├── index.html                # Typography (Outfit, Plus Jakarta Sans) & SEO meta
└── src/
    ├── api/                  # Centralized API client & service modules
    │   ├── client.js         # Centralized fetch wrapper & ApiError
    │   ├── authService.js    # Login, register, profile
    │   ├── reportsService.js # Citizen reports & photo upload
    │   ├── incidentsService.js # Incident ledger & status transitions
    │   ├── assignmentsService.js # Staff work orders & manager verification queue
    │   ├── departmentsService.js # Department management
    │   ├── usersService.js   # User management & roles
    │   ├── categoriesService.js # Issue categories & SLAs
    │   ├── notificationsService.js # User notifications
    │   ├── analyticsService.js # Recharts analytics feeds
    │   └── auditService.js   # Platform audit logs
    ├── constants/            # Canonical configurations
    │   ├── roles.js          # Canonical user roles (CITIZEN, STAFF, MANAGER, ADMIN)
    │   ├── statuses.js       # Canonical status tokens & color styles
    │   ├── categories.js     # Default category taxonomy & SLA hours
    │   └── theme.js          # Role theme gradients & accents
    ├── context/              # Global state providers
    │   ├── AuthContext.jsx   # Role verification, JWT management, auth status
    │   └── ToastContext.jsx  # Medium glassmorphic notification toasts
    ├── components/
    │   ├── common/           # GlassCard, GlassPanel, GradientButton, PageHeader, MetricCard,
    │   │                     # ChartCard, SearchInput, FilterBar, DataTable, Pagination,
    │   │                     # ConfirmDialog, EmptyState, ErrorState, SkeletonLoader,
    │   │                     # UnauthorizedState, ServiceUnavailableState
    │   ├── navigation/       # TopNavigation (role-tailored, no permanent sidebar)
    │   ├── incidents/        # IncidentCard, IncidentTable, IncidentTimeline
    │   ├── reports/          # ReportForm, PhotoUploader, LocationPicker, MapContainer
    │   └── layout/           # AppLayout with municipal footer
    ├── pages/
    │   ├── public/           # LoginPage, RegisterPage, ExplorePage, UnauthorizedPage, NotFoundPage
    │   ├── citizen/          # CitizenDashboard, CitizenReportPage, CitizenReportsPage, Notifications, Profile
    │   ├── staff/            # StaffDashboard, StaffTasksPage, StaffTaskDetailPage, StaffMapPage, Profile
    │   ├── manager/          # ManagerDashboard, ManagerIssuesPage, ManagerAssignPage, Team, Verification, Analytics
    │   └── admin/            # AdminDashboard, Users, Departments, Categories, Incidents, Analytics, Audit, Settings
    └── routes/
        ├── AppRoutes.jsx     # Route inventory with role-based routing
        └── ProtectedRoute.jsx# Auth & role verification guard
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL pointing to the CivicPulse backend server | `http://localhost:5000/api` |
| `VITE_GOOGLE_MAPS_API_KEY` | Optional Google Maps Platform API key | *(Empty — uses accessible coordinate grid fallback)* |

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
The application will be accessible at: `http://127.0.0.1:5173/`

### 3. Production Build
```bash
npm run build
```
Creates an optimized, production-ready bundle in the `dist/` directory.

---

## 🔒 Mandatory Business Rules

1. **No Mock Business Records**: No hardcoded dummy arrays substituted for production data. If an API returns no records, a meaningful `EmptyState` is displayed. If the backend is unreachable, a responsive `ErrorState` with retry controls is displayed.
2. **Authoritative Role Control**: Selecting a role on the login page sets context; the backend authoritative response strictly verifies and issues user permissions.
3. **Verified Workflow**: Reports follow the sequence:
   `Citizen Report` ➔ `Manager Review & Staff Assignment` ➔ `Staff Execution & Evidence Upload` ➔ `Manager Quality Verification or Reopen` ➔ `Citizen Notification`.
