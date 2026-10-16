import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { GlassCard } from '../../components/common/GlassCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { GradientButton } from '../../components/common/GradientButton';
import { analyticsService } from '../../api/analyticsService';
import { incidentsService } from '../../api/incidentsService';
import { usersService } from '../../api/usersService';
import { departmentsService } from '../../api/departmentsService';
import {
  ShieldCheck,
  Users,
  Building2,
  FileText,
  Activity,
  Layers,
  History,
  Settings,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      setLoading(true);
      setError(null);
      try {
        const [overviewRes, usersRes, deptsRes, incRes] = await Promise.allSettled([
          analyticsService.getPlatformOverview(),
          usersService.getUsers({ limit: 1 }),
          departmentsService.getDepartments(),
          incidentsService.getIncidents({ limit: 1 }),
        ]);

        let platformData = {};
        if (overviewRes.status === 'fulfilled') {
          platformData = overviewRes.value || {};
        }

        // Compute counts from responses if platform overview is partial
        const totalUsers =
          platformData.totalUsers ??
          (usersRes.status === 'fulfilled' ? usersRes.value?.total || usersRes.value?.length || 0 : 0);

        const totalDepartments =
          platformData.totalDepartments ??
          (deptsRes.status === 'fulfilled' ? deptsRes.value?.length || deptsRes.value?.data?.length || 0 : 0);

        const totalIncidents =
          platformData.totalIncidents ??
          (incRes.status === 'fulfilled' ? incRes.value?.total || incRes.value?.length || 0 : 0);

        const resolutionRate =
          platformData.resolutionRate ??
          (totalIncidents > 0 && platformData.resolvedIncidents !== undefined
            ? `${Math.round(((platformData.resolvedIncidents || 0) / totalIncidents) * 100)}%`
            : totalIncidents === 0
            ? '0%'
            : '—');

        setMetrics({
          totalUsers,
          totalDepartments,
          totalIncidents,
          resolutionRate,
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminOverview();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        role="admin"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Platform Governance & Oversight
          </span>
        }
        title={`Platform Administration: ${user?.name || 'Administrator'}`}
        subtitle="Manage municipal departments, user credentials and roles, issue taxonomy, platform SLA compliance, and security audit logs."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/users">
              <GradientButton role="admin" size="md" icon={Users}>
                Manage Users
              </GradientButton>
            </Link>
          </div>
        }
      />

      {/* Platform Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Registered Users"
          value={loading ? '—' : metrics?.totalUsers}
          icon={Users}
          role="admin"
          subtitle="Citizens, staff, and managers"
          onClick={() => navigate('/admin/users')}
        />
        <MetricCard
          title="Active Departments"
          value={loading ? '—' : metrics?.totalDepartments}
          icon={Building2}
          role="admin"
          subtitle="Configured municipal divisions"
          onClick={() => navigate('/admin/departments')}
        />
        <MetricCard
          title="Platform Incidents"
          value={loading ? '—' : metrics?.totalIncidents}
          icon={FileText}
          role="admin"
          subtitle="Total recorded community issues"
          onClick={() => navigate('/admin/incidents')}
        />
        <MetricCard
          title="Resolution Velocity"
          value={loading ? '—' : metrics?.resolutionRate}
          icon={Activity}
          role="admin"
          subtitle="City-wide verification rate"
          onClick={() => navigate('/admin/analytics')}
        />
      </div>

      {error && (
        <ErrorState
          title="Failed to Load Platform Metrics"
          message="Could not reach administrator analytics service."
          error={error}
          role="admin"
        />
      )}

      {/* Platform Oversight Modules Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#252238]">Platform Administration Modules</h2>
          <p className="text-xs text-[#6B687A]">Direct configuration and governance centers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <GlassCard
            tint="admin"
            hoverEffect={true}
            interactive={true}
            onClick={() => navigate('/admin/users')}
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#252238]">User Management</h3>
              <p className="text-xs text-[#6B687A] mt-1.5 leading-relaxed">
                Inspect accounts, authorize department staff, grant managerial roles, and toggle
                active status.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E9E5F0] flex items-center justify-between text-xs text-indigo-700 font-semibold">
              <span>View User Roster</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </GlassCard>

          <GlassCard
            tint="admin"
            hoverEffect={true}
            interactive={true}
            onClick={() => navigate('/admin/departments')}
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#252238]">Department Management</h3>
              <p className="text-xs text-[#6B687A] mt-1.5 leading-relaxed">
                Configure municipal divisions, assign department managers, and define service ward boundaries.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E9E5F0] flex items-center justify-between text-xs text-indigo-700 font-semibold">
              <span>Configure Departments</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </GlassCard>

          <GlassCard
            tint="admin"
            hoverEffect={true}
            interactive={true}
            onClick={() => navigate('/admin/categories')}
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#252238]">Issue Categories & SLAs</h3>
              <p className="text-xs text-[#6B687A] mt-1.5 leading-relaxed">
                Maintain problem taxonomy, default routing departments, and SLA target hours for resolution.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E9E5F0] flex items-center justify-between text-xs text-indigo-700 font-semibold">
              <span>Manage Categories</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </GlassCard>

          <GlassCard
            tint="admin"
            hoverEffect={true}
            interactive={true}
            onClick={() => navigate('/admin/analytics')}
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#252238]">Platform Analytics</h3>
              <p className="text-xs text-[#6B687A] mt-1.5 leading-relaxed">
                City-wide resolution charts, category distributions, response bottlenecks, and SLA compliance.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E9E5F0] flex items-center justify-between text-xs text-indigo-700 font-semibold">
              <span>Open Analytics Hub</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </GlassCard>

          <GlassCard
            tint="admin"
            hoverEffect={true}
            interactive={true}
            onClick={() => navigate('/admin/audit')}
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <History className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#252238]">Audit History & Security</h3>
              <p className="text-xs text-[#6B687A] mt-1.5 leading-relaxed">
                Inspect immutable system logs, role modifications, status alterations, and administrative activities.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E9E5F0] flex items-center justify-between text-xs text-indigo-700 font-semibold">
              <span>Inspect Audit Logs</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </GlassCard>

          <GlassCard
            tint="admin"
            hoverEffect={true}
            interactive={true}
            onClick={() => navigate('/admin/settings')}
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <Settings className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#252238]">Platform Settings</h3>
              <p className="text-xs text-[#6B687A] mt-1.5 leading-relaxed">
                Configure notifications, SLA breach warnings, Google Maps credentials, and API connections.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E9E5F0] flex items-center justify-between text-xs text-indigo-700 font-semibold">
              <span>System Settings</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
