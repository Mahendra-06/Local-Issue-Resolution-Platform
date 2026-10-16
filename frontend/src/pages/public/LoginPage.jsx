import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { USER_ROLES, ROLE_CONFIG } from '../../constants/roles';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  HardHat,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const ROLE_AUTH_METADATA = {
  [USER_ROLES.CITIZEN]: {
    name: 'Citizen',
    placeholder: 'citizen@example.com',
    promptText: 'Are you a citizen without an account?',
    actionText: 'Register as a Citizen',
    linkPath: '/auth/citizen/register',
    accentClass: 'text-purple-700 hover:text-purple-900',
    headerAccent: 'text-purple-600',
    ringClass: 'focus:ring-purple-400/40',
  },
  [USER_ROLES.STAFF]: {
    name: 'Department Staff',
    placeholder: 'staff@example.com',
    promptText: 'New staff member requiring assignment access?',
    actionText: 'Complete Staff Onboarding',
    linkPath: '/auth/staff/register',
    accentClass: 'text-amber-700 hover:text-amber-900',
    headerAccent: 'text-amber-600',
    ringClass: 'focus:ring-amber-400/40',
  },
  [USER_ROLES.MANAGER]: {
    name: 'Department Manager',
    placeholder: 'manager@example.com',
    promptText: 'New department supervisor requiring management access?',
    actionText: 'Complete Manager Onboarding',
    linkPath: '/auth/manager/register',
    accentClass: 'text-teal-700 hover:text-teal-900',
    headerAccent: 'text-teal-600',
    ringClass: 'focus:ring-teal-400/40',
  },
  [USER_ROLES.ADMIN]: {
    name: 'Administrator',
    placeholder: 'admin@example.com',
    promptText: 'Need administrative account provisioning?',
    actionText: 'Administrator Provisioning Notice',
    linkPath: '/auth/admin/register',
    accentClass: 'text-indigo-700 hover:text-indigo-900',
    headerAccent: 'text-indigo-600',
    ringClass: 'focus:ring-indigo-400/40',
  },
};

export const LoginPage = () => {
  const { user, role, isAuthenticated, loading, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // If user is already authenticated, redirect them directly to their role home
  React.useEffect(() => {
    if (!loading && isAuthenticated && role && ROLE_CONFIG[role]?.homePath) {
      navigate(ROLE_CONFIG[role].homePath, { replace: true });
    }
  }, [loading, isAuthenticated, role, navigate]);

  // Role context selector
  const [selectedRoleContext, setSelectedRoleContext] = useState(USER_ROLES.CITIZEN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);

  const currentMeta = ROLE_AUTH_METADATA[selectedRoleContext] || ROLE_AUTH_METADATA[USER_ROLES.CITIZEN];

  const handleRoleSelect = (roleId) => {
    setSelectedRoleContext(roleId);
    setAuthError(null);
    setErrors({});
  };

  const rolesList = [
    {
      id: USER_ROLES.CITIZEN,
      name: 'Citizen',
      desc: 'Report issues & track resolution',
      icon: User,
      color: 'from-violet-600 to-pink-600',
      border: 'hover:border-purple-300',
    },
    {
      id: USER_ROLES.STAFF,
      name: 'Department Staff',
      desc: 'Manage assigned tasks & submit work',
      icon: HardHat,
      color: 'from-orange-600 to-amber-600',
      border: 'hover:border-amber-300',
    },
    {
      id: USER_ROLES.MANAGER,
      name: 'Department Manager',
      desc: 'Review incidents & verify completion',
      icon: Briefcase,
      color: 'from-teal-700 to-emerald-600',
      border: 'hover:border-teal-300',
    },
    {
      id: USER_ROLES.ADMIN,
      name: 'Administrator',
      desc: 'System administration & audit logs',
      icon: ShieldCheck,
      color: 'from-indigo-700 to-violet-600',
      border: 'hover:border-indigo-300',
    },
  ];

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      // Authenticate with server. The server verifies credentials and returns the user's authoritative role.
      const verifiedUser = await login({
        email: email.trim(),
        password,
        requestedRole: selectedRoleContext,
      });

      const actualRole = verifiedUser?.role?.toLowerCase() || selectedRoleContext;
      const targetHome = ROLE_CONFIG[actualRole]?.homePath || '/';

      toast.success(
        'Welcome Back',
        `Authenticated as ${verifiedUser?.name || verifiedUser?.email} (${actualRole})`
      );

      navigate(targetHome, { replace: true });
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
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-6 sm:py-12">
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-xl shadow-purple-200/50 mb-3">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#252238] tracking-tight">
            CivicPulse
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#6B687A]">
            Local Problem Reporting & Resolution Platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Role Context Selector */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#6B687A]">
                Step 1: Select Your Role
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Choose the context of your platform access
              </p>
            </div>

            <div className="space-y-2.5">
              {rolesList.map((r) => {
                const IconComponent = r.icon;
                const isSelected = selectedRoleContext === r.id;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'bg-white border-purple-400 shadow-md ring-2 ring-purple-100'
                        : 'bg-white/70 border-[#E9E5F0] hover:bg-white ' + r.border
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-r ${r.color} shadow-sm`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#252238]">{r.name}</p>
                        <p className="text-xs text-[#6B687A]">{r.desc}</p>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected
                          ? 'text-purple-600 translate-x-0.5'
                          : 'text-gray-300 group-hover:text-gray-500'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 leading-relaxed">
              <span className="font-semibold block mb-0.5">Role Authorization Note:</span>
              Your authoritative role and privileges are strictly verified by the backend on
              successful authentication.
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="lg:col-span-7">
            <GlassCard className="p-6 sm:p-8">
              <div className="mb-6">
                <span className={`text-xs font-bold uppercase tracking-wider ${currentMeta.headerAccent}`}>
                  Step 2: Sign In Credentials
                </span>
                <h3 className="text-xl font-bold text-[#252238] mt-1">
                  Access {currentMeta.name} Portal
                </h3>
                <p className="text-xs text-[#6B687A] mt-0.5">
                  {currentMeta.subtitle}
                </p>
              </div>

              {authError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Authentication Error:</span>
                    <span>{authError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-bold uppercase tracking-wider text-[#252238]"
                    >
                      Email Address
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(currentMeta.email);
                        setPassword(currentMeta.password);
                        setErrors({});
                        setAuthError(null);
                      }}
                      className={`text-[11px] font-semibold ${currentMeta.accentClass} transition-colors`}
                    >
                      Fill Demo Credentials
                    </button>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={currentMeta.placeholder}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border rounded-xl text-[#252238] placeholder-gray-400 focus:outline-none focus:ring-2 ${currentMeta.ringClass} transition-all ${
                        errors.email ? 'border-rose-400' : 'border-[#E9E5F0]'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold uppercase tracking-wider text-[#252238]"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white border rounded-xl text-[#252238] placeholder-gray-400 focus:outline-none focus:ring-2 ${currentMeta.ringClass} transition-all ${
                        errors.password ? 'border-rose-400' : 'border-[#E9E5F0]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <GradientButton
                    type="submit"
                    role={selectedRoleContext}
                    size="lg"
                    loading={submitting}
                    className="w-full"
                  >
                    Sign In as {ROLE_CONFIG[selectedRoleContext]?.name}
                  </GradientButton>
                </div>
              </form>

              {/* Dynamic Registration / Onboarding Link */}
              <div className="mt-6 pt-5 border-t border-[#E9E5F0] text-center text-xs text-[#6B687A]">
                <span>{currentMeta.promptText} </span>
                <Link
                  to={currentMeta.linkPath}
                  className={`font-bold ${currentMeta.accentClass} hover:underline ml-1`}
                >
                  {currentMeta.actionText}
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};
