import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { GlassCard } from '../../components/common/GlassCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { GradientButton } from '../../components/common/GradientButton';
import { assignmentsService } from '../../api/assignmentsService';
import {
  HardHat,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Calendar,
  Send
} from 'lucide-react';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaffOverview = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await assignmentsService.getStaffTasks();
        const list = Array.isArray(response) ? response : response?.data || [];
        setTasks(list);
      } catch (err) {
        setError(err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffOverview();
  }, []);

  // Compute operational metrics from real server data
  const totalAssigned = tasks.length;
  const inProgressCount = tasks.filter((t) => t.status?.toLowerCase() === 'in_progress').length;
  const pendingVerificationCount = tasks.filter((t) => t.status?.toLowerCase() === 'pending_verification').length;
  const overdueCount = tasks.filter((t) => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date() && t.status?.toLowerCase() !== 'resolved';
  }).length;

  return (
    <div className="space-y-8">
      <PageHeader
        role="staff"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <HardHat className="w-3.5 h-3.5" /> Department Field Staff Portal
          </span>
        }
        title={`Field Operations: ${user?.name || 'Staff'}`}
        subtitle="Manage assigned municipal remediation tasks, document work progress, attach photo evidence, and submit for manager verification."
        actions={
          <Link to="/staff/tasks">
            <GradientButton role="staff" size="md" icon={ClipboardList}>
              View All Tasks ({totalAssigned})
            </GradientButton>
          </Link>
        }
      />

      {/* Operational Metrics (No hardcoding) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Assigned Tasks"
          value={loading ? '—' : totalAssigned}
          icon={ClipboardList}
          role="staff"
          subtitle="Work delegated to you"
          onClick={() => navigate('/staff/tasks')}
        />
        <MetricCard
          title="In Progress"
          value={loading ? '—' : inProgressCount}
          icon={Clock}
          role="staff"
          subtitle="Active remediation work"
          onClick={() => navigate('/staff/tasks?status=in_progress')}
        />
        <MetricCard
          title="Pending Verification"
          value={loading ? '—' : pendingVerificationCount}
          icon={Send}
          role="staff"
          subtitle="Submitted for manager review"
          onClick={() => navigate('/staff/tasks?status=pending_verification')}
        />
        <MetricCard
          title="Overdue Items"
          value={loading ? '—' : overdueCount}
          icon={AlertTriangle}
          role="staff"
          subtitle="Exceeded target SLA due date"
          onClick={() => navigate('/staff/tasks?overdue=true')}
        />
      </div>

      {error && (
        <ErrorState
          title="Could Not Load Field Tasks"
          message="Failed to connect to the CivicPulse assignments API."
          error={error}
          role="staff"
        />
      )}

      {/* Active Tasks Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#252238]">Immediate Action Queue</h2>
            <p className="text-xs text-[#6B687A]">High priority and pending field assignments</p>
          </div>
          <Link
            to="/staff/tasks"
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
          >
            <span>View all assignments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={3} type="table-row" />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No Active Assignments"
            message="You currently have no pending tasks in your dispatch queue. Check back when the department manager assigns work."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasks.slice(0, 6).map((task) => {
              const isOverdue =
                task.dueDate &&
                new Date(task.dueDate) < new Date() &&
                task.status !== 'resolved';

              return (
                <GlassCard
                  key={task.id || task._id}
                  tint="staff"
                  hoverEffect={true}
                  interactive={true}
                  onClick={() => navigate(`/staff/tasks/${task.id || task._id}`)}
                  className="p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <StatusBadge status={task.status} size="sm" />
                      <PriorityBadge priority={task.priority} size="sm" />
                    </div>

                    <h3 className="font-bold text-base text-[#252238] line-clamp-2">
                      {task.title || task.incidentTitle || `Assignment #${task.id}`}
                    </h3>

                    {task.instructions && (
                      <p className="mt-2 text-xs text-[#6B687A] bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 line-clamp-2">
                        <strong className="text-amber-900 block mb-0.5">Manager Instructions:</strong>
                        {task.instructions}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E9E5F0] text-xs text-[#6B687A] space-y-1.5">
                    {task.address && (
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{task.address}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No SLA'}
                        </span>
                      </div>

                      <span className="font-semibold text-amber-800 flex items-center gap-1">
                        Work Task <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
