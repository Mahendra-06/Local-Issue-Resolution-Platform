import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Pagination } from '../../components/common/Pagination';
import { ErrorState } from '../../components/common/ErrorState';
import { assignmentsService } from '../../api/assignmentsService';
import { HardHat, ArrowRight, MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';

export const StaffTasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await assignmentsService.getStaffTasks({
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        page,
        limit: 10,
      });

      if (Array.isArray(response)) {
        setTasks(response);
        setTotalCount(response.length);
        setTotalPages(1);
      } else if (response?.data && Array.isArray(response.data)) {
        setTasks(response.data);
        setTotalCount(response.total || response.data.length);
        setTotalPages(response.totalPages || Math.ceil((response.total || response.data.length) / 10) || 1);
      } else {
        setTasks([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const columns = [
    {
      key: 'id',
      header: 'Task ID',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
          #{item.referenceId || item.id?.substring(0, 8)}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Incident & Instructions',
      render: (item) => (
        <div className="max-w-sm">
          <p className="font-bold text-sm text-[#252238] line-clamp-1">
            {item.title || item.incidentTitle}
          </p>
          {item.instructions && (
            <p className="text-xs text-[#6B687A] line-clamp-1 italic mt-0.5">
              "{item.instructions}"
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Location',
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-[#6B687A] max-w-[200px] truncate">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate">{item.address || 'Location verified'}</span>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item) => <PriorityBadge priority={item.priority} size="sm" />,
    },
    {
      key: 'status',
      header: 'Current Status',
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'dueDate',
      header: 'Target Due Date',
      render: (item) => {
        const isOverdue =
          item.dueDate &&
          new Date(item.dueDate) < new Date() &&
          item.status !== 'resolved';
        return (
          <span
            className={`text-xs whitespace-nowrap flex items-center gap-1 ${
              isOverdue ? 'text-rose-600 font-bold' : 'text-[#6B687A]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}
          </span>
        );
      },
    },
    {
      key: 'action',
      header: '',
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/staff/tasks/${item.id || item._id}`);
          }}
          className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors"
          title="Open Task"
          aria-label={`Open task #${item.id}`}
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        role="staff"
        title="Field Tasks & Assigned Work"
        subtitle="Manage and execute remediation assignments, record progress logs, upload photo proof, and submit for verification."
      />

      <FilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        priority={priority}
        onPriorityChange={(v) => {
          setPriority(v);
          setPage(1);
        }}
        onReset={() => {
          setSearch('');
          setStatus('');
          setPriority('');
          setPage(1);
        }}
        searchPlaceholder="Search assignments by task or location..."
      />

      {error && (
        <ErrorState
          title="Could Not Load Task Records"
          message="Failed to fetch assignments from the API."
          error={error}
          onRetry={fetchTasks}
          role="staff"
        />
      )}

      <DataTable
        columns={columns}
        data={tasks}
        loading={loading}
        emptyTitle="No Assigned Tasks"
        emptyMessage="You have no tasks matching the selected filters in your assignment queue."
        onRowClick={(item) => navigate(`/staff/tasks/${item.id || item._id}`)}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
        onPageChange={setPage}
      />
    </div>
  );
};
