import React from 'react';
import { DataTable } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { getCategoryById } from '../../constants/categories';
import { MapPin, Calendar, ArrowRight, UserCheck } from 'lucide-react';

export const IncidentTable = ({
  incidents = [],
  loading = false,
  onSelectIncident = null,
  showDepartment = false,
  showAssignment = false,
  emptyTitle = 'No incidents found',
  emptyMessage = 'There are no active incidents matching your selected filters.',
  className = '',
}) => {
  const columns = [
    {
      key: 'referenceId',
      header: 'ID',
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
          #{item.referenceId || item.id?.substring(0, 8)}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Issue & Category',
      render: (item) => {
        const cat = getCategoryById(item.categoryId || item.category);
        return (
          <div className="max-w-xs">
            <p className="font-bold text-sm text-[#252238] line-clamp-1">{item.title}</p>
            <span className="text-[11px] text-[#6B687A]">{cat?.name || 'General Issue'}</span>
          </div>
        );
      },
    },
    {
      key: 'address',
      header: 'Location',
      render: (item) => (
        <div className="flex items-center gap-1 text-xs text-[#6B687A] max-w-[200px] truncate">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate">{item.address || item.locationName || 'Coords verified'}</span>
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
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    ...(showDepartment
      ? [
          {
            key: 'department',
            header: 'Department',
            render: (item) => (
              <span className="text-xs text-[#252238] font-medium">
                {item.departmentName || item.department?.name || '—'}
              </span>
            ),
          },
        ]
      : []),
    ...(showAssignment
      ? [
          {
            key: 'assignedTo',
            header: 'Assigned Staff',
            render: (item) => (
              <div className="flex items-center gap-1.5 text-xs text-[#252238]">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{item.assignedStaffName || item.assignee?.name || 'Unassigned'}</span>
              </div>
            ),
          },
        ]
      : []),
    {
      key: 'createdAt',
      header: 'Reported',
      render: (item) => (
        <span className="text-xs text-[#6B687A] whitespace-nowrap">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            : '—'}
        </span>
      ),
    },
    ...(onSelectIncident
      ? [
          {
            key: 'actions',
            header: '',
            render: (item) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectIncident(item);
                }}
                className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors"
                title="View incident details"
                aria-label={`View details for incident #${item.referenceId || item.id}`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      data={incidents}
      loading={loading}
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
      onRowClick={onSelectIncident}
      className={className}
    />
  );
};
