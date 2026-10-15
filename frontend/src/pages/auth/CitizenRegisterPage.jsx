import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../api/authService';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';

export const CitizenRegisterPage = () => {
  const { setAuthSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ward: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

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
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid email address.';
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
      const response = await authService.registerCitizen({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        ward: formData.ward.trim(),
        address: formData.ward.trim(),
        password: formData.password,
      });

      const authToken = response?.token || response?.accessToken;
      const verifiedUser = response?.user || response;

      if (authToken && verifiedUser) {
        setAuthSession(authToken, verifiedUser);
      }

      toast.success(
        'Account Created',
        'Welcome to CivicPulse. You are registered as a Citizen and can now submit and track issues.'
      );

      navigate('/citizen');
    } catch (err) {
      setServerError(
        err.message || 'Registration failed. Please check your credentials or connection.'
      );
      toast.error('Registration Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center py-8 sm:py-12 px-4 bg-gradient-to-b from-[#F7F5FC] via-[#FAF9FD] to-[#F2EFF8]">
      <div className="w-full max-w-[540px] mx-auto">
        {/* Navigation back */}
        <div className="mb-4">
          <Link
            to="/auth/select-role"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B687A] hover:text-purple-700 transition-colors py-1 px-2.5 rounded-lg hover:bg-white/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Role</span>
          </Link>
        </div>

        {/* Top Header Badge & Titles */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-xl shadow-purple-200/50 mb-3">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252238] tracking-tight">
            Citizen Registration
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6B687A]">
            Create your CivicPulse citizen account to report municipal problems
          </p>
        </div>

        {/* Form Card */}
        <GlassCard className="p-6 sm:p-8 shadow-xl shadow-purple-900/5 border-[#E9E5F0]/90">
          {serverError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">Registration Error</p>
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
                  placeholder="Jane Citizen"
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400/30 ${
                    errors.name ? 'border-rose-400' : 'border-[#E9E5F0] focus:border-purple-500'
                  }`}
                />
              </div>
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email Address & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    required
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400/30 ${
                      errors.email ? 'border-rose-400' : 'border-[#E9E5F0] focus:border-purple-500'
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
                    placeholder="+1555-0199"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border border-[#E9E5F0] focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all duration-150"
                  />
                </div>
              </div>
            </div>

            {/* Residential Neighborhood / Ward */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#474358] mb-1.5">
                RESIDENTIAL NEIGHBORHOOD / WARD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  placeholder="Ward 12, West End, Greenfield District"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border border-[#E9E5F0] focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all duration-150"
                />
              </div>
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
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400/30 ${
                      errors.password ? 'border-rose-400' : 'border-[#E9E5F0] focus:border-purple-500'
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
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white/90 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400/30 ${
                      errors.confirmPassword
                        ? 'border-rose-400'
                        : 'border-[#E9E5F0] focus:border-purple-500'
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
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-md shadow-purple-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  <span>Create Citizen Account</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer link */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-[#6B687A]">
            <span>Already have a CivicPulse account? </span>
            <Link
              to="/auth/citizen/login"
              className="font-bold text-purple-700 hover:text-purple-900 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
