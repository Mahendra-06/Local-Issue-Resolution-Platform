import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../api/authService';
import {
  HardHat,
  User,
  Mail,
  Phone,
  BadgeAlert,
  Building,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';

export const StaffRegisterPage = () => {
  const { setAuthSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
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
      errs.email = 'Work email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid work email address.';
    }

    if (!formData.departmentId) {
      errs.departmentId = 'Department selection is required.';
    }

    if (!formData.authorizationCode.trim()) {
      errs.authorizationCode = 'Staff authorization code is required.';
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
      const response = await authService.registerStaff({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        employeeId: formData.employeeId.trim(),
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
        'Staff Account Provisioned',
        'Your staff identity has been authenticated. Redirecting to your assigned field tasks.'
      );

      navigate('/staff');
    } catch (err) {
      setServerError(
        err.message || 'Staff onboarding authorization failed. Please check your authorization code.'
      );
      toast.error('Onboarding Authorization Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center py-8 sm:py-12 px-4 bg-gradient-to-b from-[#FFF9F5] via-[#FCF8F5] to-[#F8F2EC]">
      <div className="w-full max-w-[560px] mx-auto">
        {/* Navigation back */}
        <div className="mb-4">
          <Link
            to="/auth/select-role"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B687A] hover:text-amber-700 transition-colors py-1 px-2.5 rounded-lg hover:bg-white/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Role</span>
          </Link>
        </div>

        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-200/50 mb-3">
            <HardHat className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252238] tracking-tight">
            Department Staff Onboarding
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6B687A]">
            Authorized field operations & task resolution access
          </p>
        </div>

        {/* Authorization Policy Callout */}
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Controlled Onboarding:</span> Staff accounts require
            authorized municipal credentials. Enter your department authorization code (e.g.{' '}
            <code className="font-mono bg-amber-100/80 px-1 py-0.5 rounded text-amber-950 font-semibold">
              STAFF-AUTH-2026
            </code>
            ) issued by your department administrator.
          </div>
        </div>

        {/* Form Card */}
        <GlassCard className="p-6 sm:p-8 shadow-xl shadow-amber-900/5 border-[#EFE9E0]/90">
          {serverError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">Onboarding Error</p>
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
                  placeholder="Officer Alex Rivera"
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${
                    errors.name ? 'border-rose-400' : 'border-[#EAE4DC] focus:border-amber-500'
                  }`}
                />
              </div>
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email Address & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358] mb-1.5">
                  WORK EMAIL <span className="text-rose-500">*</span>
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
                    placeholder="staff.member@civicpulse.gov"
                    required
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${
                      errors.email ? 'border-rose-400' : 'border-[#EAE4DC] focus:border-amber-500'
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
                    placeholder="+1 (555) 234-5678"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border border-[#EAE4DC] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all duration-150"
                  />
                </div>
              </div>
            </div>

            {/* Employee ID & Department Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358] mb-1.5">
                  STAFF / BADGE IDENTIFIER
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <BadgeAlert className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="e.g. EMP-PW-4402"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border border-[#EAE4DC] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all duration-150"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358] mb-1.5">
                  DEPARTMENT <span className="text-rose-500">*</span>
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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border border-[#EAE4DC] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all duration-150"
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
            </div>

            {/* Staff Authorization Code */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358] mb-1.5">
                STAFF AUTHORIZATION / INVITATION CODE <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="authorizationCode"
                  value={formData.authorizationCode}
                  onChange={handleChange}
                  placeholder="Enter authorized code (e.g. STAFF-AUTH-2026)"
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm font-mono tracking-wider bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${
                    errors.authorizationCode
                      ? 'border-rose-400'
                      : 'border-[#EAE4DC] focus:border-amber-500'
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
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${
                      errors.password ? 'border-rose-400' : 'border-[#EAE4DC] focus:border-amber-500'
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
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${
                      errors.confirmPassword
                        ? 'border-rose-400'
                        : 'border-[#EAE4DC] focus:border-amber-500'
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
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Authorization...</span>
                  </span>
                ) : (
                  <span>Complete Staff Onboarding</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer link */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-[#6B687A]">
            <span>Already have authorized staff access? </span>
            <Link
              to="/auth/staff/login"
              className="font-bold text-amber-700 hover:text-amber-900 transition-colors"
            >
              Sign In to Staff Portal
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
