import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterBar } from '../../components/common/FilterBar';
import { IncidentTable } from '../../components/incidents/IncidentTable';
import { Pagination } from '../../components/common/Pagination';
import { ErrorState } from '../../components/common/ErrorState';
import { GlassCard } from '../../components/common/GlassCard';
import { MapContainer } from '../../components/reports/MapContainer';
import { isValidCoordinate } from '../../api/routingService';
import { incidentsService } from '../../api/incidentsService';
import { Table as TableIcon, Map as MapIcon, Layers } from 'lucide-react';

export const AdminIncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'map'

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await incidentsService.getIncidents({
        search: search || undefined,
        status: status || undefined,
        category: category || undefined,
        priority: priority || undefined,
        page,
        limit: 15,
      });

      if (Array.isArray(response)) {
        setIncidents(response);
        setTotalCount(response.length);
        setTotalPages(1);
      } else if (response?.data && Array.isArray(response.data)) {
        setIncidents(response.data);
        setTotalCount(response.total || response.data.length);
        setTotalPages(response.totalPages || Math.ceil((response.total || response.data.length) / 15) || 1);
      } else {
        setIncidents([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, category, priority]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        title="Platform Incident Records"
        subtitle="Universal ledger of all community-reported problems across all municipal departments and wards."
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
        category={category}
        onCategoryChange={(v) => {
          setCategory(v);
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
          setCategory('');
          setPriority('');
          setPage(1);
        }}
        searchPlaceholder="Search all platform incidents..."
      />

      {error && (
        <ErrorState
          title="Could Not Load Incidents"
          message="Failed to fetch incidents from the server."
          error={error}
          onRetry={fetchIncidents}
          role="admin"
        />
      )}

      {/* View Mode Toggle Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#6B687A] font-semibold">
          Showing {totalCount} total platform incident record{totalCount === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E9E5F0] shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-[#6B687A] hover:text-[#252238] hover:bg-gray-50'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-[#6B687A] hover:text-[#252238] hover:bg-gray-50'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Geographic Map View</span>
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          <IncidentTable
            incidents={incidents}
            loading={loading}
            showDepartment={true}
            showAssignment={true}
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalCount}
            onPageChange={setPage}
          />
        </>
      ) : (
        <GlassCard className="p-4 overflow-hidden space-y-3">
          <div className="flex items-center justify-between text-xs text-[#6B687A] px-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-700" />
              <span>Universal Incident Map: Geographic distribution of incidents across all municipal departments</span>
            </span>
            <span className="font-semibold text-indigo-900">
              {incidents.filter((i) => isValidCoordinate(i.latitude, i.longitude)).length} mapped of {incidents.length} loaded
            </span>
          </div>
          <MapContainer
            center={{ lat: 12.9716, lng: 77.5946 }}
            zoom={13}
            markers={incidents}
            height="560px"
            role="admin"
            emptyMessage={
              incidents.length > 0
                ? 'Current filtered incidents do not have geographic coordinates recorded.'
                : 'No platform incidents match the active filters.'
            }
          />
        </GlassCard>
      )}
    </div>
  );
};
