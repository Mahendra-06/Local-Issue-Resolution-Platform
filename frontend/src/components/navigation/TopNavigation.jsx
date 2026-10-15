import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../constants/roles';
import { getRoleTheme } from '../../constants/theme';
import {
  Building2,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Shield,
  Layers,
  CheckSquare,
  MapPin,
  ClipboardList,
  Users,
  BarChart2,
  History,
  Settings,
  HardHat,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { GradientButton } from '../common/GradientButton';

export const TopNavigation = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const theme = getRoleTheme(role);

  // Navigation Links tailored to the verified role
  const getNavLinks = () => {
    switch (role) {
      case USER_ROLES.CITIZEN:
        return [
          { label: 'Home', path: '/citizen' },
          { label: 'My Reports', path: '/citizen/reports' },
          { label: 'Notifications', path: '/citizen/notifications' },
          { label: 'Profile', path: '/citizen/profile' },
        ];
      case USER_ROLES.STAFF:
        return [
          { label: 'Overview', path: '/staff' },
          { label: 'My Tasks', path: '/staff/tasks' },
          { label: 'Issue Map', path: '/staff/map' },
          { label: 'Updates', path: '/staff/updates' },
          { label: 'Profile', path: '/staff/profile' },
        ];
      case USER_ROLES.MANAGER:
        return [
          { label: 'Overview', path: '/manager' },
          { label: 'Issues', path: '/manager/issues' },
          { label: 'Assignments', path: '/manager/assignments' },
          { label: 'Team', path: '/manager/team' },
          { label: 'Verification', path: '/manager/verification' },
          { label: 'Analytics', path: '/manager/analytics' },
          { label: 'Profile', path: '/manager/profile' },
        ];
      case USER_ROLES.ADMIN:
        return [
          { label: 'Overview', path: '/admin' },
          { label: 'Departments', path: '/admin/departments' },
          { label: 'Users', path: '/admin/users' },
          { label: 'Incidents', path: '/admin/incidents' },
          { label: 'Categories', path: '/admin/categories' },
          { label: 'Analytics', path: '/admin/analytics' },
          { label: 'Audit History', path: '/admin/audit' },
          { label: 'Settings', path: '/admin/settings' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-[#E9E5F0] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link
              to={role ? `/${role}` : '/login'}
              className="flex items-center gap-2.5 group"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition-transform group-hover:scale-105 ${
                  role === USER_ROLES.STAFF
                    ? 'bg-gradient-to-tr from-orange-600 to-amber-500 shadow-orange-200'
                    : role === USER_ROLES.MANAGER
                    ? 'bg-gradient-to-tr from-teal-700 to-emerald-500 shadow-teal-200'
                    : role === USER_ROLES.ADMIN
                    ? 'bg-gradient-to-tr from-indigo-700 to-violet-600 shadow-indigo-200'
                    : 'bg-gradient-to-tr from-violet-600 to-pink-500 shadow-violet-200'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-[#252238] flex items-center gap-1.5">
                  CivicPulse
                  {role && (
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                        role === USER_ROLES.STAFF
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : role === USER_ROLES.MANAGER
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : role === USER_ROLES.ADMIN
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {role}
                    </span>
                  )}
                </span>
                <span className="hidden sm:block text-[11px] text-[#6B687A] -mt-1 font-medium">
                  Municipal Resolution Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {navLinks.length > 0 && (
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === `/${role}`}
                  className={({ isActive }) =>
                    `px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-150 ${
                      isActive
                        ? theme.activeNav
                        : 'text-[#6B687A] hover:text-[#252238] hover:bg-gray-100/70'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Prominent Citizen Action */}
            {role === USER_ROLES.CITIZEN && (
              <Link to="/citizen/report" className="hidden sm:inline-block">
                <GradientButton
                  role="citizen"
                  size="md"
                  icon={PlusCircle}
                >
                  Report a Problem
                </GradientButton>
              </Link>
            )}

            {/* Authenticated User Menu */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-[#E9E5F0] bg-white hover:bg-gray-50 transition-colors shadow-sm"
                  aria-expanded={profileDropdownOpen}
                  aria-label="User profile options"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-[#252238]">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-[#252238] leading-tight max-w-[120px] truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-[10px] text-[#6B687A] capitalize leading-none mt-0.5">
                      {role || 'Citizen'}
                    </p>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E9E5F0] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#E9E5F0]">
                      <p className="text-xs font-bold text-[#252238] truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to={role ? `/${role}/profile` : '/login'}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Account Profile</span>
                    </Link>

                    {role === USER_ROLES.CITIZEN && (
                      <Link
                        to="/citizen/notifications"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Bell className="w-4 h-4 text-gray-400" />
                        <span>Notifications</span>
                      </Link>
                    )}

                    <div className="my-1 border-t border-[#E9E5F0]" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/select-role"
                  className="hidden sm:inline-flex text-xs font-semibold text-[#6B687A] hover:text-purple-700 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Roles
                </Link>
                <Link to="/login">
                  <GradientButton variant="outline" size="sm">
                    Sign In
                  </GradientButton>
                </Link>
                <Link to="/register">
                  <GradientButton variant="primary" size="sm">
                    Register
                  </GradientButton>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E9E5F0] bg-white/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-1">
          {role === USER_ROLES.CITIZEN && (
            <div className="pb-3">
              <Link
                to="/citizen/report"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block"
              >
                <GradientButton role="citizen" size="md" icon={PlusCircle} className="w-full">
                  Report a Problem
                </GradientButton>
              </Link>
            </div>
          )}

          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm font-semibold rounded-xl ${
                  isActive ? theme.activeNav : 'text-[#6B687A] hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {!user && (
            <div className="pt-2 space-y-1 border-t border-[#E9E5F0]">
              <Link
                to="/auth/select-role"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold rounded-xl text-[#6B687A] hover:bg-gray-100"
              >
                Select Role
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold rounded-xl text-[#6B687A] hover:bg-gray-100"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100"
              >
                Create Citizen Account
              </Link>
            </div>
          )}

          {user && (
            <div className="pt-3 border-t border-[#E9E5F0] flex items-center justify-between px-2">
              <div className="text-xs">
                <span className="font-bold text-[#252238] block">{user.name}</span>
                <span className="text-gray-500 capitalize">{role}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
