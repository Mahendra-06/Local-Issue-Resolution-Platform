import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterBar } from '../../components/common/FilterBar';
import { IncidentTable } from '../../components/incidents/IncidentTable';
import { GlassCard } from '../../components/common/GlassCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { IncidentTimeline } from '../../components/incidents/IncidentTimeline';
import { Pagination } from '../../components/common/Pagination';
import { ErrorState } from '../../components/common/ErrorState';
import { GradientButton } from '../../components/common/GradientButton';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { incidentsService } from '../../api/incidentsService';
import { useToast } from '../../context/ToastContext';
import { MapContainer } from '../../components/reports/MapContainer';
import { isValidCoordinate } from '../../api/routingService';
import {
  X,
  MapPin,
  Calendar,
  UserCheck,
  UserPlus,
  Send,
  AlertCircle,
  Clock,
  ArrowRight,
  Table as TableIcon,
  Map as MapIcon,
  Layers,
} from 'lucide-react';

export const ManagerIssuesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // View mode toggle
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'map'

  // Selected incident modal
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Status transition state
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await incidentsService.getIncidents({
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        category: category || undefined,
        page,
        limit: 12,
      });

      if (Array.isArray(response)) {
        setIncidents(response);
        setTotalCount(response.length);
        setTotalPages(1);
      } else if (response?.data && Array.isArray(response.data)) {
        setIncidents(response.data);
        setTotalCount(response.total || response.data.length);
        setTotalPages(response.totalPages || Math.ceil((response.total || response.data.length) / 12) || 1);
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
  }, [page, search, status, priority, category]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setUpdatingStatus(true);
    try {
      const updated = await incidentsService.updateIncidentStatus(selectedIncident.id, {
        status: newStatus,
        notes: statusNotes || `Manager updated status to ${newStatus}`,
      });

      toast.success('Status Updated', `Incident status set to ${newStatus}`);
      setSelectedIncident((prev) => ({
        ...prev,
        status: newStatus,
        ...(updated || {}),
      }));

      // Refresh list
      fetchIncidents();
      setNewStatus('');
      setStatusNotes('');
    } catch (err) {
      toast.error('Update Failed', err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="manager"
        title="Department Incident Management"
        subtitle="Search, filter, prioritize, and manage the full lifecycle of community-reported infrastructure problems."
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
        category={category}
        onCategoryChange={(v) => {
          setCategory(v);
          setPage(1);
        }}
        onReset={() => {
          setSearch('');
          setStatus('');
          setPriority('');
          setCategory('');
          setPage(1);
        }}
        searchPlaceholder="Search incidents by reference ID, title, or address..."
      />

      {error && (
        <ErrorState
          title="Could Not Load Incidents"
          message="Failed to retrieve incidents from the backend."
          error={error}
          onRetry={fetchIncidents}
          role="manager"
        />
      )}

      {/* View Mode Toggle Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#6B687A] font-semibold">
          Showing {totalCount} total department incident record{totalCount === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E9E5F0] shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-teal-700 text-white shadow-sm'
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
                ? 'bg-teal-700 text-white shadow-sm'
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
            showAssignment={true}
            onSelectIncident={(item) => setSelectedIncident(item)}
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
              <Layers className="w-4 h-4 text-teal-700" />
              <span>Interactive Incident Pins: Click any pin to open full manager resolution & dispatch panel</span>
            </span>
            <span className="font-semibold text-teal-900">
              {incidents.filter((i) => isValidCoordinate(i.latitude, i.longitude)).length} mapped of {incidents.length} loaded
            </span>
          </div>
          <MapContainer
            center={{ lat: 12.9716, lng: 77.5946 }}
            zoom={13}
            markers={incidents}
            selectedMarkerId={selectedIncident?.id}
            onMarkerClick={(item) => setSelectedIncident(item)}
            height="560px"
            role="manager"
            emptyMessage={
              incidents.length > 0
                ? 'Current filtered incidents do not have geographic coordinates recorded.'
                : 'No incidents match the active filters.'
            }
          />
        </GlassCard>
      )}

      {/* Incident Detail & Status Control Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-[#E9E5F0] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setSelectedIncident(null)}
              className="absolute right-5 top-5 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  #{selectedIncident.referenceId || selectedIncident.id?.substring(0, 8)}
                </span>
                <StatusBadge status={selectedIncident.status} size="sm" />
                <PriorityBadge priority={selectedIncident.priority} size="sm" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#252238]">
                {selectedIncident.title}
              </h2>
            </div>

            {selectedIncident.photoUrl && (
              <div className="h-64 rounded-2xl overflow-hidden bg-gray-100 border border-[#E9E5F0] mb-5">
                <img
                  src={selectedIncident.photoUrl}
                  alt={selectedIncident.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Citizen Report Details
                </span>
                <p className="text-[#252238] bg-[#F8F7FC] p-4 rounded-xl border border-[#E9E5F0] leading-relaxed text-sm">
                  {selectedIncident.description || 'No detailed description.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-[#E9E5F0]">
                  <span className="text-gray-400 block mb-0.5">Location</span>
                  <div className="flex items-center gap-1.5 font-semibold text-[#252238]">
                    <MapPin className="w-4 h-4 text-teal-700" />
                    <span>{selectedIncident.address}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E9E5F0]">
                  <span className="text-gray-400 block mb-0.5">Assigned Staff</span>
                  <div className="flex items-center gap-1.5 font-semibold text-[#252238]">
                    <UserCheck className="w-4 h-4 text-teal-700" />
                    <span>
                      {selectedIncident.assignedStaffName ||
                        selectedIncident.assignee?.name ||
                        'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update / Action Section */}
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-3">
                <span className="font-bold text-teal-950 block">Manager Status Control</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-teal-200 rounded-xl outline-none"
                  >
                    <option value="">Choose new status...</option>
                    <option value="under_review">Mark Under Review</option>
                    <option value="in_progress">Mark In Progress</option>
                    <option value="rejected">Reject Incident</option>
                    <option value="reopened">Reopen Incident</option>
                  </select>

                  <input
                    type="text"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Reason or update notes..."
                    className="w-full p-2.5 text-xs bg-white border border-teal-200 rounded-xl outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIncident(null);
                      navigate(`/manager/assignments?incidentId=${selectedIncident.id}`);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-950 underline"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign or Reassign Staff</span>
                  </button>

                  <GradientButton
                    onClick={handleUpdateStatus}
                    disabled={!newStatus}
                    loading={updatingStatus}
                    role="manager"
                    size="sm"
                  >
                    Apply Status Change
                  </GradientButton>
                </div>
              </div>

              {/* Geographic Incident Location Preview */}
              {isValidCoordinate(selectedIncident.latitude, selectedIncident.longitude) && (
                <div>
                  <span className="font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Incident Map & Geographic Coordinates
                  </span>
                  <MapContainer
                    center={{
                      lat: Number(selectedIncident.latitude),
                      lng: Number(selectedIncident.longitude),
                    }}
                    zoom={15}
                    interactive={true}
                    markers={[
                      {
                        id: selectedIncident.id,
                        latitude: Number(selectedIncident.latitude),
                        longitude: Number(selectedIncident.longitude),
                        title: selectedIncident.title,
                        status: selectedIncident.status,
                        priority: selectedIncident.priority,
                        address: selectedIncident.address,
                      },
                    ]}
                    height="200px"
                    role="manager"
                  />
                </div>
              )}

              {/* Timeline */}
              <div>
                <span className="font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Status History
                </span>
                <IncidentTimeline
                  timeline={selectedIncident.timeline || []}
                  currentStatus={selectedIncident.status}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
