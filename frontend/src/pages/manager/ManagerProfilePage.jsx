import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Briefcase, Mail, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ManagerProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        role="manager"
        title="Department Manager Profile"
        subtitle="Operational coordination credentials, oversight department, and supervisory status."
      />

      <GlassCard tint="manager" className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-[#E9E5F0]">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-2xl">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#252238]">{user?.name}</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300">
              Authorized Department Manager
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-white rounded-xl border border-[#E9E5F0]">
            <span className="text-gray-400 block mb-1">Email Address</span>
            <div className="flex items-center gap-2 font-semibold text-[#252238]">
              <Mail className="w-4 h-4 text-teal-700" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#E9E5F0]">
            <span className="text-gray-400 block mb-1">Assigned Department</span>
            <div className="flex items-center gap-2 font-semibold text-[#252238]">
              <Building2 className="w-4 h-4 text-teal-700" />
              <span>{user?.departmentName || user?.department?.name || 'Public Works & Roads'}</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#E9E5F0]">
            <span className="text-gray-400 block mb-1">Verification Authority</span>
            <div className="flex items-center gap-2 font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Authorized to Verify Resolution & Reopen</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#E9E5F0]">
            <span className="text-gray-400 block mb-1">Supervisory ID</span>
            <div className="flex items-center gap-2 font-mono text-[#252238]">
              <span>ID: {user?.id || 'MGR-AUTH-01'}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
