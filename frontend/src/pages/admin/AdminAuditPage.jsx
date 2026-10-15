import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { GlassCard } from '../../components/common/GlassCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { auditService } from '../../api/auditService';
import { History, Shield, Clock, User, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AdminAuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditService.getAuditLogs();
      const list = Array.isArray(response) ? response : response?.data || [];
      setLogs(list);
    } catch (err) {
      setError(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (item) => (
        <span className="text-xs font-mono text-gray-500 flex items-center gap-1 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          {item.timestamp || item.createdAt
            ? new Date(item.timestamp || item.createdAt).toLocaleString()
            : '—'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Event / Action',
      render: (item) => (
        <span className="font-semibold text-xs text-[#252238] bg-gray-100 px-2.5 py-1 rounded-lg">
          {item.action || item.event || 'System Action'}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'User / Actor',
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-[#252238]">
          <User className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-medium">{item.actorName || item.userEmail || item.userId || 'System'}</span>
        </div>
      ),
    },
    {
      key: 'target',
      header: 'Entity / Target ID',
      render: (item) => (
        <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
          {item.entityType ? `${item.entityType}: ` : ''}
          {item.targetId || item.entityId || '—'}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Details & Changes',
      render: (item) => (
        <p className="text-xs text-[#6B687A] max-w-sm truncate" title={item.details || item.description}>
          {item.details || item.description || 'Action recorded successfully'}
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        title="Security & Platform Audit Logs"
        subtitle="Cryptographically verified historical record of security operations, role changes, work allocations, and status modifications."
      />

      {error && (
        <ErrorState
          title="Could Not Load Audit Log"
          message="Failed to retrieve authorized audit events from the server."
          error={error}
          onRetry={fetchAuditLogs}
          role="admin"
        />
      )}

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        emptyTitle="No Audit Events Recorded"
        emptyMessage="The backend server has not generated any security or administrative audit records yet."
      />
    </div>
  );
};
