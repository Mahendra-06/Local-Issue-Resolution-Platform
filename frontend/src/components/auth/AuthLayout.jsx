import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';

export const AuthLayout = ({
  title,
  subtitle,
  icon: Icon = Building2,
  iconGradient = 'from-purple-600 to-pink-500',
  children,
  backTo = '/auth/select-role',
  backLabel = 'Change Role',
  maxWidth = 'max-w-xl',
}) => {
  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center py-8 sm:py-12 px-4 bg-gradient-to-b from-[#F7F5FC] via-[#FAF9FD] to-[#F2EFF8]">
      <div className={`w-full ${maxWidth} mx-auto`}>
        {/* Top Navigation / Back link */}
        {backTo && (
          <div className="mb-4">
            <Link
              to={backTo}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B687A] hover:text-purple-700 transition-colors py-1 px-2.5 rounded-lg hover:bg-white/60"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{backLabel}</span>
            </Link>
          </div>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr ${iconGradient} text-white shadow-xl shadow-purple-200/50 mb-3`}
          >
            <Icon className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252238] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-[#6B687A] max-w-md mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content Box */}
        <GlassCard className="p-6 sm:p-8 shadow-xl shadow-purple-900/5 border-[#E9E5F0]/90">
          {children}
        </GlassCard>

        {/* Security badge footer */}
        <div className="mt-6 text-center text-[11px] text-[#8C889B] flex items-center justify-center gap-2">
          <span>CivicPulse Secure Identity Verification</span>
          <span>•</span>
          <span>Role-Guarded Access</span>
        </div>
      </div>
    </div>
  );
};
