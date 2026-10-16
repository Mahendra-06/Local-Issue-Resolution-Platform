import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { GlassCard } from '../../components/common/GlassCard';
import { IncidentCard } from '../../components/incidents/IncidentCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { GradientButton } from '../../components/common/GradientButton';
import { reportsService } from '../../api/reportsService';
import { categoriesService } from '../../api/categoriesService';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Bell
} from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myReports, setMyReports] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [reportsRes, catRes] = await Promise.allSettled([
          reportsService.getMyReports({ limit: 50 }),
          categoriesService.getCategories(),
        ]);

        if (reportsRes.status === 'fulfilled') {
          const response = reportsRes.value;
          const rData = Array.isArray(response) ? response : response?.data || [];
          setMyReports(rData);
          setTotalCount(response?.total ?? (Array.isArray(response) ? response.length : rData.length));
        }

        if (catRes.status === 'fulfilled') {
          const cResponse = catRes.value;
          const cData = Array.isArray(cResponse) ? cResponse : cResponse?.data || [];
          setCategories(cData);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Compute actual metrics from fetched server records
  const totalReports = totalCount;
  const inProgressReports = myReports.filter((r) =>
    ['assigned', 'in_progress', 'under_review'].includes(r.status?.toLowerCase())
  ).length;
  const resolvedReports = myReports.filter(
    (r) => r.status?.toLowerCase() === 'resolved'
  ).length;

  return (
    <div className="space-y-8">
      {/* Personalized Greeting Header */}
      <PageHeader
        role="citizen"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5" /> Citizen Portal
          </span>
        }
        title={`Welcome, ${user?.name || 'Citizen'}`}
        subtitle="Report municipal concerns, track repair timelines in real-time, and stay informed on local issue resolutions."
        actions={
          <Link to="/citizen/report">
            <GradientButton
              role="citizen"
              size="lg"
              icon={PlusCircle}
            >
              Report a Problem
            </GradientButton>
          </Link>
        }
      />

      {/* Operational Metrics (Calculated from actual server data) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          title="Total Reports Submitted"
          value={loading ? '—' : totalReports}
          icon={FileText}
          role="citizen"
          subtitle="Your submitted community reports"
          onClick={() => navigate('/citizen/reports')}
        />
        <MetricCard
          title="Active & In-Progress"
          value={loading ? '—' : inProgressReports}
          icon={Clock}
          role="citizen"
          subtitle="Assigned to municipal teams"
          onClick={() => navigate('/citizen/reports')}
        />
        <MetricCard
          title="Verified & Resolved"
          value={loading ? '—' : resolvedReports}
          icon={CheckCircle}
          role="citizen"
          subtitle="Completed and verified fixes"
          onClick={() => navigate('/citizen/reports')}
        />
      </div>

      {/* Categories Explorer Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#252238]">Report by Category</h2>
            <p className="text-xs text-[#6B687A]">Select an issue type to immediately dispatch a repair request</p>
          </div>
          <Link
            to="/citizen/report"
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
          >
            <span>Open Report Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <GlassCard
                key={cat.id || cat.key || cat._id}
                hoverEffect={true}
                interactive={true}
                onClick={() => navigate(`/citizen/report?category=${cat.id || cat.key || cat._id}`)}
                className="p-4 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-purple-700 block mb-1">
                    SLA: {cat.slaHours || 24}h Target
                  </span>
                  <h4 className="font-bold text-sm text-[#252238] line-clamp-1">{cat.name}</h4>
                  <p className="text-[11px] text-[#6B687A] mt-1 line-clamp-2 leading-relaxed">
                    {cat.description || 'Municipal repair category'}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#E9E5F0] flex items-center justify-between text-[11px] text-gray-500">
                  <span className="truncate">{cat.department || 'Public Works'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Layers}
            title="No Categories Available"
            message="No issue categories have been registered in the system."
          />
        )}
      </div>

      {/* My Reports Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#252238]">My Recent Reports</h2>
            <p className="text-xs text-[#6B687A]">Status and progress on problems you reported</p>
          </div>
          <Link
            to="/citizen/reports"
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
          >
            <span>View all reports ({totalReports})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {error && (
          <ErrorState
            title="Could Not Load Reports"
            message="Failed to retrieve your report history from the server."
            error={error}
            role="citizen"
          />
        )}

        {loading && !error && <SkeletonLoader count={3} type="card" />}

        {!loading && !error && myReports.length === 0 && (
          <EmptyState
            title="No Reports Filed Yet"
            message="You haven't submitted any municipal problem reports yet. Notice an issue in your neighborhood?"
            action={
              <Link to="/citizen/report">
                <GradientButton role="citizen" size="sm" icon={PlusCircle}>
                  Report a Problem
                </GradientButton>
              </Link>
            }
          />
        )}

        {!loading && !error && myReports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myReports.slice(0, 6).map((item) => (
              <IncidentCard
                key={item.id || item._id}
                incident={item}
                role="citizen"
                onSelect={() => navigate('/citizen/reports')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
