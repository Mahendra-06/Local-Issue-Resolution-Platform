import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../api/authService';
import {
  BriefcaseBusiness,
  User,
  Mail,
  Phone,
  Building,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';

export const ManagerRegisterPage = () => {
  const { setAuthSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    authorizationCode: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await authService.getPublicDepartments();
        const list = res?.departments || res?.data?.departments || [];
        setDepartments(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, departmentId: list[0]._id || list[0].id }));
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Official work email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid official work email address.';
    }

    if (!formData.departmentId) {
      errs.departmentId = 'Department oversight assignment is required.';
    }

    if (!formData.authorizationCode.trim()) {
      errs.authorizationCode = 'Administrator authorization code is required.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await authService.registerManager({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        departmentId: formData.departmentId,
        authorizationCode: formData.authorizationCode.trim(),
        password: formData.password,
      });

      const authToken = response?.token || response?.accessToken;
      const verifiedUser = response?.user || response;

      if (authToken && verifiedUser) {
        setAuthSession(authToken, verifiedUser);
      }

      toast.success(
        'Manager Account Provisioned',
        'Department manager access verified. Redirecting to management console.'
      );

      navigate('/manager');
    } catch (err) {
      setServerError(
        err.message ||
          'Manager authorization validation failed. Access requires authorized system administrator approval.'
      );
      toast.error('Authorization Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center py-8 sm:py-12 px-4 bg-gradient-to-b from-[#F2FBF9] via-[#F6FCFB] to-[#EEF8F6]">
      <div className="w-full max-w-[560px] mx-auto">
        {/* Navigation back */}
        <div className="mb-4">
          <Link
            to="/auth/select-role"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B687A] hover:text-teal-700 transition-colors py-1 px-2.5 rounded-lg hover:bg-white/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Role</span>
          </Link>
        </div>

        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white shadow-xl shadow-teal-200/50 mb-3">
            <BriefcaseBusiness className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252238] tracking-tight">
            Department Manager Onboarding
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6B687A]">
            Restricted administrative onboarding for municipal department supervisors
          </p>
        </div>

        {/* Security Policy Callout */}
        <div className="mb-4 p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/90 text-xs text-teal-950 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Administrative Authorization Required:</span> Department
            managers must be authorized by system administrators. Enter your administrative authorization
            code (e.g.{' '}
            <code className="font-mono bg-teal-100/90 px-1 py-0.5 rounded text-teal-950 font-semibold">
              MGR-AUTH-2026
            </code>
            ) to activate department oversight privileges.
          </div>
        </div>

        {/* Form Card */}
        <GlassCard className="p-6 sm:p-8 shadow-xl shadow-teal-900/5 border-[#E0F0EC]/90">
          {serverError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">Authorization Error</p>
                <p className="mt-0.5">{serverError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358] mb-1.5">
                FULL NAME <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Director Sarah Jenkins"
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400/30 ${
                    errors.name ? 'border-rose-400' : 'border-[#E2EDE9] focus:border-teal-500'
                  }`}
                />
              </div>
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email Address & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358] mb-1.5">
                  OFFICIAL WORK EMAIL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="manager@civicpulse.gov"
                    required
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400/30 ${
                      errors.email ? 'border-rose-400' : 'border-[#E2EDE9] focus:border-teal-500'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358] mb-1.5">
                  PHONE NUMBER
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 345-6789"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border border-[#E2EDE9] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all duration-150"
                  />
                </div>
              </div>
            </div>

            {/* Managed Department Selection */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358] mb-1.5">
                DEPARTMENT UNDER MANAGEMENT <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Building className="w-4 h-4" />
                </div>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  disabled={loadingDepts}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border border-[#E2EDE9] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all duration-150"
                >
                  {departments.map((dept) => (
                    <option key={dept._id || dept.id} value={dept._id || dept.id}>
                      {dept.name} ({dept.code || 'DEPT'})
                    </option>
                  ))}
                </select>
              </div>
              {errors.departmentId && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.departmentId}</p>
              )}
            </div>

            {/* Administrator Authorization Code */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358] mb-1.5">
                ADMINISTRATOR AUTHORIZATION CODE <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="authorizationCode"
                  value={formData.authorizationCode}
                  onChange={handleChange}
                  placeholder="Enter administrator authorization key (e.g. MGR-AUTH-2026)"
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm font-mono tracking-wider bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400/30 ${
                    errors.authorizationCode
                      ? 'border-rose-400'
                      : 'border-[#E2EDE9] focus:border-teal-500'
                  }`}
                />
              </div>
              {errors.authorizationCode && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.authorizationCode}</p>
              )}
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358] mb-1.5">
                  PASSWORD <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    required
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400/30 ${
                      errors.password ? 'border-rose-400' : 'border-[#E2EDE9] focus:border-teal-500'
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

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358] mb-1.5">
                  CONFIRM PASSWORD <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400/30 ${
                      errors.confirmPassword
                        ? 'border-rose-400'
                        : 'border-[#E2EDE9] focus:border-teal-500'
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Manager Clearance...</span>
                  </span>
                ) : (
                  <span>Provision Manager Account</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer link */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-[#6B687A]">
            <span>Already have manager clearance? </span>
            <Link
              to="/auth/manager/login"
              className="font-bold text-teal-700 hover:text-teal-900 transition-colors"
            >
              Sign In to Management Console
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
