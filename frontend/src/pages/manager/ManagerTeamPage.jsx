import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { usersService } from '../../api/usersService';
import { Users, Mail, Phone, ShieldCheck, HardHat, CheckCircle, Clock } from 'lucide-react';

export const ManagerTeamPage = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await usersService.getUsers({ role: 'staff' });
        const list = Array.isArray(response) ? response : response?.data || [];
        setTeam(list);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        role="manager"
        title="Department Field Operations Team"
        subtitle="Active technicians, engineers, and field specialists authorized to execute municipal remediation work orders."
      />

      {error && (
        <ErrorState
          title="Could Not Load Team Records"
          message="Failed to retrieve department staff list from the backend."
          error={error}
          role="manager"
        />
      )}

      {loading && !error && <SkeletonLoader count={4} type="card" />}

      {!loading && !error && team.length === 0 && (
        <EmptyState
          icon={Users}
          title="No Field Staff Registered"
          message="There are currently no staff members registered in your department. Platform administrators can create and assign staff accounts."
        />
      )}

      {!loading && !error && team.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((member) => (
            <GlassCard key={member.id || member._id} tint="manager" className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
                  {member.name ? member.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#252238]">{member.name}</h4>
                  <span className="text-xs text-teal-700 font-semibold block capitalize">
                    {member.role || 'Field Operations'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#6B687A] pt-2 border-t border-[#E9E5F0]">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E9E5F0] flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Active for Dispatch
                </span>
                <span className="text-gray-400 font-mono text-[11px]">
                  ID: #{member.id?.substring(0, 6)}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
