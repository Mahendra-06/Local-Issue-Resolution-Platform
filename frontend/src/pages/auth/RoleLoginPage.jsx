import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLE_CONFIG, USER_ROLES } from '../../constants/roles';
import {
  User,
  HardHat,
  BriefcaseBusiness,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Building2,
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';

const ROLE_SETTINGS = {
  citizen: {
    key: 'citizen',
    title: 'Citizen Sign In',
    subtitle: 'Access your reported issues, updates, and community resolution tracking',
    icon: User,
    gradient: 'from-violet-600 to-pink-500',
    ring: 'focus:ring-purple-400/30',
    border: 'focus:border-purple-500',
    badgeText: 'Citizen Portal',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
    homePath: '/citizen',
    registerPath: '/auth/citizen/register',
    registerLabel: "Don't have an account? Create Citizen Account",
  },
  staff: {
    key: 'staff',
    title: 'Department Staff Sign In',
    subtitle: 'Manage assigned tasks, update work status, and submit field verifications',
    icon: HardHat,
    gradient: 'from-orange-500 to-amber-500',
    ring: 'focus:ring-amber-400/30',
    border: 'focus:border-amber-500',
    badgeText: 'Field Staff Operations',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    homePath: '/staff',
    registerPath: '/auth/staff/register',
    registerLabel: 'New staff member? Complete Staff Onboarding',
  },
  manager: {
    key: 'manager',
    title: 'Department Manager Sign In',
    subtitle: 'Supervise department incidents, assign staff, and verify completed resolutions',
    icon: BriefcaseBusiness,
    gradient: 'from-teal-600 to-emerald-600',
    ring: 'focus:ring-teal-400/30',
    border: 'focus:border-teal-500',
    badgeText: 'Manager Console',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    homePath: '/manager',
    registerPath: '/auth/manager/register',
    registerLabel: 'New department head? Complete Manager Onboarding',
  },
  admin: {
    key: 'admin',
    title: 'Administrator Sign In',
    subtitle: 'Municipal system governance, user provisioning, categories, and audit oversight',
    icon: ShieldCheck,
    gradient: 'from-indigo-600 to-violet-600',
    ring: 'focus:ring-indigo-400/30',
    border: 'focus:border-indigo-500',
    badgeText: 'System Administration',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    homePath: '/admin',
    registerPath: '/auth/admin/register',
    registerLabel: 'Need provisioning assistance? View Administrator Provisioning Policy',
  },
};

export const RoleLoginPage = ({ roleOverride }) => {
  const { role: urlRole } = useParams();
  const effectiveRole = (roleOverride || urlRole || 'citizen').toLowerCase();
  const currentConfig = ROLE_SETTINGS[effectiveRole] || ROLE_SETTINGS.citizen;

  const { login, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [roleMismatch, setRoleMismatch] = useState(null);

  const IconComponent = currentConfig.icon;

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setRoleMismatch(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const verifiedUser = await login({
        email: email.trim(),
        password,
        requestedRole: currentConfig.key,
      });

      const actualRole = (verifiedUser?.role || '').toLowerCase();

      // Enforce strict role boundary check
      if (actualRole !== currentConfig.key) {
        // Log mismatch and inform user without auto-upgrading privileges
        const mismatchInfo = {
          expected: currentConfig.key,
          actual: actualRole,
          actualHome: ROLE_CONFIG[actualRole]?.homePath || '/login',
          actualName: ROLE_CONFIG[actualRole]?.name || actualRole,
        };
        setRoleMismatch(mismatchInfo);
        toast.error(
          'Role Context Mismatch',
          `Your verified account role is "${mismatchInfo.actualName}". You cannot sign in via the ${currentConfig.title} portal.`
        );
        return;
      }

      toast.success(
        'Authentication Successful',
        `Welcome back, ${verifiedUser?.name || verifiedUser?.email}. Signed into ${currentConfig.title}.`
      );

      navigate(currentConfig.homePath);
    } catch (err) {
      setAuthError(
        err.message || 'Authentication failed. Please verify your credentials or server connection.'
      );
      toast.error('Sign In Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center py-8 sm:py-12 px-4 bg-gradient-to-b from-[#F7F5FC] via-[#FAF9FD] to-[#F2EFF8]">
      <div className="w-full max-w-[500px] mx-auto">
        {/* Navigation back */}
        <div className="mb-4">
          <Link
            to="/auth/select-role"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B687A] hover:text-purple-700 transition-colors py-1 px-2.5 rounded-lg hover:bg-white/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Role Context</span>
          </Link>
        </div>

        {/* Top Header */}
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr ${currentConfig.gradient} text-white shadow-xl shadow-purple-200/50 mb-3`}
          >
            <IconComponent className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252238] tracking-tight">
              {currentConfig.title}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#6B687A] max-w-sm mx-auto">
            {currentConfig.subtitle}
          </p>
        </div>

        {/* Form Card */}
        <GlassCard className="p-6 sm:p-8 shadow-xl shadow-purple-900/5 border-[#E9E5F0]/90">
          {/* Role Mismatch Warning */}
          {roleMismatch && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Role Access Notice</p>
                  <p className="mt-1 leading-relaxed">
                    This account is registered with the role{' '}
                    <span className="font-semibold underline uppercase">
                      {roleMismatch.actualName}
                    </span>
                    . For security, access to the <strong>{currentConfig.title}</strong> is
                    restricted to verified {currentConfig.key} accounts.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(roleMismatch.actualHome)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 transition-colors flex items-center gap-1.5"
                    >
                      <span>Go to {roleMismatch.actualName} Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setRoleMismatch(null);
                      }}
                      className="text-xs text-amber-800 underline hover:text-amber-950 font-semibold"
                    >
                      Sign In with Another Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Server Error */}
          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">Sign In Failed</p>
                <p className="mt-0.5">{authError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358] mb-1.5">
                EMAIL ADDRESS <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder={
                    effectiveRole === 'citizen'
                      ? 'jane@example.com'
                      : effectiveRole === 'staff'
                      ? 'staff@civicpulse.gov'
                      : effectiveRole === 'manager'
                      ? 'manager@civicpulse.gov'
                      : 'admin@civicpulse.gov'
                  }
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 ${
                    currentConfig.ring
                  } ${errors.email ? 'border-rose-400' : `border-[#E9E5F0] ${currentConfig.border}`}`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358]">
                  PASSWORD <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="Enter your password"
                  required
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 ${
                    currentConfig.ring
                  } ${
                    errors.password ? 'border-rose-400' : `border-[#E9E5F0] ${currentConfig.border}`
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${currentConfig.gradient} hover:opacity-95 shadow-md shadow-purple-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <span>Sign In to {currentConfig.title}</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer link to role onboarding */}
          {currentConfig.registerPath && (
            <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-[#6B687A]">
              <Link
                to={currentConfig.registerPath}
                className="font-semibold text-purple-700 hover:text-purple-900 transition-colors"
              >
                {currentConfig.registerLabel}
              </Link>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
