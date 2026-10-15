import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { UnauthorizedState } from '../components/common/UnauthorizedState';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8F7FC]">
        <div className="max-w-md w-full">
          <SkeletonLoader count={3} type="card" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <UnauthorizedState
          title="Access Restricted"
          message={`Your account role (${role || 'Unknown'}) does not have permission to access this area.`}
        />
      </div>
    );
  }

  return <Outlet />;
};
