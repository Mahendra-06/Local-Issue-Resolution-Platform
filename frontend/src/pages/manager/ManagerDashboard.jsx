import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { GlassCard } from '../../components/common/GlassCard';
import { IncidentTable } from '../../components/incidents/IncidentTable';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { GradientButton } from '../../components/common/GradientButton';
import { incidentsService } from '../../api/incidentsService';
import { assignmentsService } from '../../api/assignmentsService';
import { analyticsService } from '../../api/analyticsService';
import {
  Briefcase,
  AlertCircle,
  UserCheck,
  Clock,
  CheckCircle,
  ClipboardList,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchManagerData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [incidentsRes, vQueueRes, metricsRes] = await Promise.allSettled([
          incidentsService.getIncidents({ limit: 15 }),
          assignmentsService.getVerificationQueue(),
          analyticsService.getManagerMetrics(),
        ]);

        if (incidentsRes.status === 'fulfilled') {
          const incData = incidentsRes.value;
          setIncidents(Array.isArray(incData) ? incData : incData?.data || []);
        }

        if (vQueueRes.status === 'fulfilled') {
          const vData = vQueueRes.value;
          setVerificationQueue(Array.isArray(vData) ? vData : vData?.data || []);
        }

        if (metricsRes.status === 'fulfilled') {
          const mData = metricsRes.value;
          setMetrics(mData?.data || mData || null);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagerData();
  }, []);

  // Compute authoritative metrics from backend database response
  const totalActive = metrics?.active ?? incidents.filter((i) => i.status !== 'resolved').length;
  const unassignedCount =
    metrics?.unassigned ??
    incidents.filter(
      (i) => !i.assignedStaffId && !i.assignedTo && ['reported', 'under_review'].includes(i.status?.toLowerCase())
    ).length;
  const inProgressCount =
    metrics?.inProgress ?? incidents.filter((i) => i.status?.toLowerCase() === 'in_progress').length;
  const pendingVerificationCount =
    metrics?.pendingVerification ??
    (verificationQueue.length ||
      incidents.filter((i) => i.status?.toLowerCase() === 'pending_verification').length);
  const resolvedCount =
    metrics?.resolved ?? incidents.filter((i) => i.status?.toLowerCase() === 'resolved').length;
  const overdueCount = incidents.filter((i) => {
    if (!i.dueDate) return false;
    return new Date(i.dueDate) < new Date() && i.status !== 'resolved';
  }).length;

  return (
    <div className="space-y-8">
      <PageHeader
        role="manager"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
            <Briefcase className="w-3.5 h-3.5" /> Department Operations Control
          </span>
        }
        title={`Department Manager: ${user?.name || 'Manager'}`}
        subtitle="Review community incidents, assign staff with instructions and SLAs, supervise field remediation, and verify completed resolutions."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/manager/verification">
              <GradientButton role="manager" size="md" icon={ShieldCheck}>
                Verification Queue ({pendingVerificationCount})
              </GradientButton>
            </Link>
          </div>
        }
      />

      {/* Operational Metrics (No hardcoding) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <MetricCard
          title="Active Issues"
          value={loading ? '—' : totalActive}
          role="manager"
          onClick={() => navigate('/manager/issues')}
        />
        <MetricCard
          title="Unassigned"
          value={loading ? '—' : unassignedCount}
          role="manager"
          trend={unassignedCount > 0 ? { value: `${unassignedCount} new`, positive: false } : null}
          onClick={() => navigate('/manager/assignments')}
        />
        <MetricCard
          title="In Progress"
          value={loading ? '—' : inProgressCount}
          role="manager"
          onClick={() => navigate('/manager/issues?status=in_progress')}
        />
        <MetricCard
          title="Pending Verify"
          value={loading ? '—' : pendingVerificationCount}
          role="manager"
          trend={pendingVerificationCount > 0 ? { value: 'Needs Review', positive: false } : null}
          onClick={() => navigate('/manager/verification')}
        />
        <MetricCard
          title="Resolved"
          value={loading ? '—' : resolvedCount}
          role="manager"
          onClick={() => navigate('/manager/issues?status=resolved')}
        />
        <MetricCard
          title="Overdue"
          value={loading ? '—' : overdueCount}
          role="manager"
          onClick={() => navigate('/manager/issues?overdue=true')}
        />
      </div>

      {error && (
        <ErrorState
          title="Failed to Load Department Ledger"
          message="Could not retrieve department incidents from the backend API."
          error={error}
          role="manager"
        />
      )}

      {/* Verification Attention Queue (Priority Section) */}
      {pendingVerificationCount > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50/50 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-teal-950">
                {pendingVerificationCount} Incident{pendingVerificationCount > 1 ? 's' : ''} Awaiting Resolution Verification
              </h3>
              <p className="text-xs text-teal-800 mt-0.5">
                Staff have submitted completion photos and work notes. Inspect evidence to approve or reopen.
              </p>
            </div>
          </div>
          <Link to="/manager/verification" className="shrink-0 w-full sm:w-auto">
            <GradientButton role="manager" size="sm">
              Open Verification Queue
            </GradientButton>
          </Link>
        </div>
      )}

      {/* Recent Department Incidents Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#252238]">Active Incidents Ledger</h2>
            <p className="text-xs text-[#6B687A]">Recently reported or updated department incidents</p>
          </div>
          <Link
            to="/manager/issues"
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1"
          >
            <span>View All Incidents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <IncidentTable
          incidents={incidents.slice(0, 8)}
          loading={loading}
          showAssignment={true}
          onSelectIncident={(item) => navigate(`/manager/issues?id=${item.id || item._id}`)}
          emptyTitle="No Incidents Reported"
          emptyMessage="Your department currently has no active or pending incidents in the queue."
        />
      </div>
    </div>
  );
};
