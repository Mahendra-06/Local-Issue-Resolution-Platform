import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  User,
  HardHat,
  BriefcaseBusiness,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { RoleSelectionCard } from '../../components/auth/RoleSelectionCard';

export const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('citizen');

  const roleList = [
    {
      roleKey: 'citizen',
      name: 'Citizen',
      description: 'Report issues & track resolution',
      icon: User,
      accentGradient: 'from-violet-600 to-pink-500',
      badgeText: 'Public Access',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      loginPath: '/auth/citizen/login',
      registerPath: '/auth/citizen/register',
    },
    {
      roleKey: 'staff',
      name: 'Department Staff',
      description: 'Manage assigned tasks & submit work',
      icon: HardHat,
      accentGradient: 'from-orange-500 to-amber-500',
      badgeText: 'Authorized Personnel',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      loginPath: '/auth/staff/login',
      registerPath: '/auth/staff/register',
    },
    {
      roleKey: 'manager',
      name: 'Department Manager',
      description: 'Review incidents & verify completion',
      icon: BriefcaseBusiness,
      accentGradient: 'from-teal-600 to-emerald-600',
      badgeText: 'Department Oversight',
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
      loginPath: '/auth/manager/login',
      registerPath: '/auth/manager/register',
    },
    {
      roleKey: 'admin',
      name: 'Administrator',
      description: 'System administration & audit logs',
      icon: ShieldCheck,
      accentGradient: 'from-indigo-600 to-violet-600',
      badgeText: 'System Owner',
      badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      loginPath: '/auth/admin/login',
      registerPath: '/auth/admin/register',
    },
  ];

  const handleContinue = () => {
    const roleObj = roleList.find((r) => r.roleKey === selectedRole);
    if (roleObj) {
      navigate(roleObj.loginPath);
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center py-8 sm:py-14 px-4 bg-gradient-to-b from-[#F7F5FC] via-[#FAF9FD] to-[#F2EFF8]">
      <div className="w-full max-w-3xl mx-auto">
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

        {/* Card Container */}
        <GlassCard className="p-6 sm:p-8 shadow-xl shadow-purple-900/5 border-[#E9E5F0]/90">
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-700">
              STEP 1: SELECT YOUR ROLE
            </h2>
            <p className="text-sm text-[#6B687A] mt-0.5">
              Choose the context of your platform access
            </p>
          </div>

          {/* Vertically Stacked Role Cards */}
          <div className="space-y-3.5">
            {roleList.map((roleItem) => (
              <RoleSelectionCard
                key={roleItem.roleKey}
                {...roleItem}
                isSelected={selectedRole === roleItem.roleKey}
                onSelect={() => setSelectedRole(roleItem.roleKey)}
              />
            ))}
          </div>

          {/* Bottom Action */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#6B687A]">
              <Info className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                Select a card to navigate directly, or click <strong>Continue to Portal</strong>.
              </span>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>

        {/* Security Notice */}
        <div className="mt-6 p-4 rounded-2xl bg-white/70 border border-[#E9E5F0] text-xs text-[#6B687A] flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Server-Enforced Role Authorization:</strong> Selecting a role on this screen sets the
            user-interface context only. Platform permissions, department memberships, and workflow actions
            are strictly authenticated and governed by the backend server.
          </p>
        </div>
      </div>
    </div>
  );
};
