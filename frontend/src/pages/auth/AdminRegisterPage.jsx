import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  KeyRound,
  Terminal,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';

export const AdminRegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center py-8 sm:py-12 px-4 bg-gradient-to-b from-[#F3F2FD] via-[#F8F7FD] to-[#EFEFFC]">
      <div className="w-full max-w-[560px] mx-auto">
        {/* Navigation back */}
        <div className="mb-4">
          <Link
            to="/auth/select-role"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B687A] hover:text-indigo-700 transition-colors py-1 px-2.5 rounded-lg hover:bg-white/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Role</span>
          </Link>
        </div>

        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-200/50 mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252238] tracking-tight">
            Administrator Security Notice
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6B687A]">
            Restricted system-level provisioning & administrative governance
          </p>
        </div>

        {/* Main Glass Card */}
        <GlassCard className="p-6 sm:p-8 shadow-xl shadow-indigo-900/5 border-[#E2E1F3]/90">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/90 text-indigo-950 mb-6 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold block text-sm mb-1 text-indigo-900">
                Self-Registration Disabled by Security Policy
              </span>
              Under municipal security protocol and audit regulations, system administrator accounts
              cannot be registered through public web forms. Privileges must be granted by the system
              owner or deployment orchestrator.
            </div>
          </div>

          <div className="space-y-4 text-xs text-[#474358] leading-relaxed mb-6">
            <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/70">
              <h3 className="font-bold text-[#252238] flex items-center gap-2 mb-1.5 text-sm">
                <Terminal className="w-4 h-4 text-indigo-600" />
                Administrative Provisioning Procedure
              </h3>
              <p className="text-gray-600 mb-2">
                Administrator accounts are provisioned directly during system deployment or by running the
                official administrative seeding utility in the backend directory:
              </p>
              <div className="p-2.5 rounded-lg bg-[#1E1B2E] text-purple-200 font-mono text-[11px] select-all">
                npm run seed
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/70">
              <h3 className="font-bold text-[#252238] flex items-center gap-2 mb-1 text-sm">
                <Lock className="w-4 h-4 text-indigo-600" />
                Standard Provisioned Administrator
              </h3>
              <p className="text-gray-600">
                If the platform has been initialized using standard deployment fixtures, sign in using
                your system owner administrative credentials:
              </p>
              <p className="mt-1 font-mono text-gray-800 font-semibold">
                admin@civicpulse.gov
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/auth/admin/login')}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Administrator Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/auth/select-role"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#6B687A] hover:text-[#252238] hover:bg-gray-100/70 border border-gray-200/80 transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Role Selection</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
