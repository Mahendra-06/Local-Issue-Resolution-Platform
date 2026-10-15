import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { authService } from '../../api/authService';
import { User, Mail, Phone, MapPin, Shield, Save } from 'lucide-react';

export const CitizenProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile(formData);
      await refreshUser();
      toast.success('Profile Updated', 'Your profile details have been saved.');
    } catch (err) {
      toast.error('Update Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        role="citizen"
        title="Citizen Profile"
        subtitle="Manage your personal contact details, residential location, and notification preferences."
      />

      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-4 pb-6 border-b border-[#E9E5F0]">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-2xl">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#252238]">{user?.name}</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                Verified Citizen Account
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] focus:ring-2 focus:ring-purple-400/40 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-[#E9E5F0] rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Managed by municipal authentication provider</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 555-0100"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] focus:ring-2 focus:ring-purple-400/40 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
              Residential Ward / Neighborhood
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] focus:ring-2 focus:ring-purple-400/40 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E9E5F0] flex justify-end">
            <GradientButton
              type="submit"
              role="citizen"
              size="md"
              loading={saving}
              icon={Save}
            >
              Save Profile Changes
            </GradientButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
