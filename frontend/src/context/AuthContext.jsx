import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/authService';
import { USER_ROLES, getRoleDetails } from '../constants/roles';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('civicpulse_token'));
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('civicpulse_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      // Server returned valid user profile
      setUser(userData?.user || userData);
    } catch {
      // Token is expired, invalid, or server is unavailable
      localStorage.removeItem('civicpulse_token');
      localStorage.removeItem('civicpulse_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for unauthorized events from API client
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('civicpulse_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('civicpulse_unauthorized', handleUnauthorized);
    };
  }, [checkAuth]);

  const login = async ({ email, password, requestedRole }) => {
    // Submit credentials to backend
    const response = await authService.login({ email, password, requestedRole });

    const authToken = response?.token || response?.accessToken;
    const verifiedUser = response?.user || response;

    if (!authToken || !verifiedUser) {
      throw new Error('Authentication response was invalid or missing security credentials.');
    }

    // Persist verified session
    localStorage.setItem('civicpulse_token', authToken);
    localStorage.setItem('civicpulse_user', JSON.stringify(verifiedUser));

    setToken(authToken);
    setUser(verifiedUser);

    return verifiedUser;
  };

  const setAuthSession = (authToken, verifiedUser) => {
    if (authToken && verifiedUser) {
      localStorage.setItem('civicpulse_token', authToken);
      localStorage.setItem('civicpulse_user', JSON.stringify(verifiedUser));
      setToken(authToken);
      setUser(verifiedUser);
    }
  };

  const register = async (registrationData) => {
    const response = await authService.register(registrationData);
    const authToken = response?.token || response?.accessToken;
    const verifiedUser = response?.user || response;

    if (authToken && verifiedUser) {
      setAuthSession(authToken, verifiedUser);
    }

    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Local clean-up
    } finally {
      localStorage.removeItem('civicpulse_token');
      localStorage.removeItem('civicpulse_user');
      setUser(null);
      setToken(null);
    }
  };

  const refreshUser = async () => {
    try {
      const data = await authService.getCurrentUser();
      const updated = data?.user || data;
      setUser(updated);
      localStorage.setItem('civicpulse_user', JSON.stringify(updated));
      return updated;
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
      return null;
    }
  };

  const role = user?.role?.toLowerCase() || null;
  const roleConfig = getRoleDetails(role);

  const value = {
    user,
    role,
    roleConfig,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    setAuthSession,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
