import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES, ROLE_CONFIG } from '../constants/roles';

// Public Pages
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { UnauthorizedPage } from '../pages/public/UnauthorizedPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

// Role-Specific Authentication & Registration Pages
import { RoleSelectionPage } from '../pages/auth/RoleSelectionPage';
import { RoleLoginPage } from '../pages/auth/RoleLoginPage';
import { CitizenRegisterPage } from '../pages/auth/CitizenRegisterPage';
import { StaffRegisterPage } from '../pages/auth/StaffRegisterPage';
import { ManagerRegisterPage } from '../pages/auth/ManagerRegisterPage';
import { AdminRegisterPage } from '../pages/auth/AdminRegisterPage';

// Citizen Pages
import { CitizenDashboard } from '../pages/citizen/CitizenDashboard';
import { CitizenReportPage } from '../pages/citizen/CitizenReportPage';
import { CitizenReportsPage } from '../pages/citizen/CitizenReportsPage';
import { CitizenNotificationsPage } from '../pages/citizen/CitizenNotificationsPage';
import { CitizenProfilePage } from '../pages/citizen/CitizenProfilePage';

// Staff Pages
import { StaffDashboard } from '../pages/staff/StaffDashboard';
import { StaffTasksPage } from '../pages/staff/StaffTasksPage';
import { StaffTaskDetailPage } from '../pages/staff/StaffTaskDetailPage';
import { StaffMapPage } from '../pages/staff/StaffMapPage';
import { StaffProfilePage } from '../pages/staff/StaffProfilePage';

// Manager Pages
import { ManagerDashboard } from '../pages/manager/ManagerDashboard';
import { ManagerIssuesPage } from '../pages/manager/ManagerIssuesPage';
import { ManagerAssignPage } from '../pages/manager/ManagerAssignPage';
import { ManagerTeamPage } from '../pages/manager/ManagerTeamPage';
import { ManagerVerificationPage } from '../pages/manager/ManagerVerificationPage';
import { ManagerAnalyticsPage } from '../pages/manager/ManagerAnalyticsPage';
import { ManagerProfilePage } from '../pages/manager/ManagerProfilePage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminDepartmentsPage } from '../pages/admin/AdminDepartmentsPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminIncidentsPage } from '../pages/admin/AdminIncidentsPage';
import { AdminAnalyticsPage } from '../pages/admin/AdminAnalyticsPage';
import { AdminAuditPage } from '../pages/admin/AdminAuditPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

// Root redirect handler: directly redirects to role dashboard or login
const RootRedirect = () => {
  const { user, role, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated && role && ROLE_CONFIG[role]?.homePath) {
    return <Navigate to={ROLE_CONFIG[role].homePath} replace />;
  }
  return <Navigate to="/login" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Root Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public & Role-Specific Authentication Routes */}
        <Route path="/auth/select-role" element={<RoleSelectionPage />} />
        <Route path="/auth/citizen/register" element={<CitizenRegisterPage />} />
        <Route path="/auth/citizen/login" element={<RoleLoginPage roleOverride="citizen" />} />
        <Route path="/auth/staff/register" element={<StaffRegisterPage />} />
        <Route path="/auth/staff/login" element={<RoleLoginPage roleOverride="staff" />} />
        <Route path="/auth/manager/register" element={<ManagerRegisterPage />} />
        <Route path="/auth/manager/login" element={<RoleLoginPage roleOverride="manager" />} />
        <Route path="/auth/admin/register" element={<AdminRegisterPage />} />
        <Route path="/auth/admin/login" element={<RoleLoginPage roleOverride="admin" />} />
        <Route path="/auth/:role/login" element={<RoleLoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Citizen Routes */}
        <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.CITIZEN]} />}>
          <Route path="/citizen" element={<CitizenDashboard />} />
          <Route path="/citizen/report" element={<CitizenReportPage />} />
          <Route path="/citizen/reports" element={<CitizenReportsPage />} />
          <Route path="/citizen/notifications" element={<CitizenNotificationsPage />} />
          <Route path="/citizen/profile" element={<CitizenProfilePage />} />
        </Route>

        {/* Department Staff Routes */}
        <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.STAFF]} />}>
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/tasks" element={<StaffTasksPage />} />
          <Route path="/staff/tasks/:id" element={<StaffTaskDetailPage />} />
          <Route path="/staff/map" element={<StaffMapPage />} />
          <Route path="/staff/updates" element={<StaffTasksPage />} />
          <Route path="/staff/profile" element={<StaffProfilePage />} />
        </Route>

        {/* Department Manager Routes */}
        <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.MANAGER]} />}>
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/issues" element={<ManagerIssuesPage />} />
          <Route path="/manager/assignments" element={<ManagerAssignPage />} />
          <Route path="/manager/team" element={<ManagerTeamPage />} />
          <Route path="/manager/verification" element={<ManagerVerificationPage />} />
          <Route path="/manager/analytics" element={<ManagerAnalyticsPage />} />
          <Route path="/manager/profile" element={<ManagerProfilePage />} />
        </Route>

        {/* Administrator Routes */}
        <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/incidents" element={<AdminIncidentsPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/audit" element={<AdminAuditPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/profile" element={<AdminSettingsPage />} />
        </Route>

        {/* Catch-all Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
