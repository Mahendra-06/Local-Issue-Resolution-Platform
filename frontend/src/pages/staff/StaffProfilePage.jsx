import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { HardHat, Mail, Phone, Building2, Shield, Calendar } from 'lucide-react';

export const StaffProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        role="staff"
        title="Field Staff Profile"
        subtitle="Department field technician credentials, assigned division, and active operational status."
      />

      <GlassCard tint="staff" className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-[#E9E5F0]">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-2xl">
            <HardHat className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#252238]">{user?.name}</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Department Field Operations Staff
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-white rounded-xl border border-[#E9E5F0]">
            <span className="text-gray-400 block mb-1">Email Address</span>
            <div className="flex items-center gap-2 font-semibold text-[#252238]">
              <Mail className="w-4 h-4 text-amber-600" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#E9E5F0]">
            <span className="text-gray-400 block mb-1">Assigned Department</span>
            <div className="flex items-center gap-2 font-semibold text-[#252238]">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>{user?.departmentName || user?.department?.name || 'Municipal Works'}</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#E9E5F0]">
            <span className="text-gray-400 block mb-1">Staff Authorization</span>
            <div className="flex items-center gap-2 font-semibold text-[#252238]">
              <Shield className="w-4 h-4 text-amber-600" />
              <span className="text-emerald-700 font-bold">Authorized for Field Repair & Evidence Upload</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#E9E5F0]">
            <span className="text-gray-400 block mb-1">Staff ID</span>
            <div className="flex items-center gap-2 font-mono text-[#252238]">
              <span>ID: {user?.id || 'AUTH-STAFF-01'}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
