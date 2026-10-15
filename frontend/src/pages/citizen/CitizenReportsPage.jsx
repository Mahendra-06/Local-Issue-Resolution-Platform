import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterBar } from '../../components/common/FilterBar';
import { IncidentCard } from '../../components/incidents/IncidentCard';
import { IncidentTimeline } from '../../components/incidents/IncidentTimeline';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { GlassCard } from '../../components/common/GlassCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { GradientButton } from '../../components/common/GradientButton';
import { reportsService } from '../../api/reportsService';
import { getCategoryById } from '../../constants/categories';
import { MapContainer } from '../../components/reports/MapContainer';
import { isValidCoordinate } from '../../api/routingService';
import { PlusCircle, X, MapPin, Calendar, Clock, Layers, Image as ImageIcon } from 'lucide-react';

export const CitizenReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  // Selected report for timeline / details view
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchMyReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportsService.getMyReports({
        search: search || undefined,
        status: status || undefined,
        category: category || undefined,
      });

      const list = Array.isArray(response) ? response : response?.data || [];
      setReports(list);

      // Default select first item if available and none selected
      if (list.length > 0 && !selectedReport) {
        setSelectedReport(list[0]);
      }
    } catch (err) {
      setError(err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, category, selectedReport]);

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setCategory('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="citizen"
        title="My Submitted Reports"
        subtitle="Track status milestones, manager reviews, and resolution timelines for all problems you reported."
        actions={
          <Link to="/citizen/report">
            <GradientButton role="citizen" size="md" icon={PlusCircle}>
              New Report
            </GradientButton>
          </Link>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        category={category}
        onCategoryChange={setCategory}
        onReset={handleResetFilters}
        searchPlaceholder="Search your reports by title or address..."
      />

      {/* Error State */}
      {error && (
        <ErrorState
          title="Could Not Load Your Reports"
          message="Failed to retrieve report history from the server."
          error={error}
          onRetry={fetchMyReports}
          role="citizen"
        />
      )}

      {/* Loading state */}
      {loading && !error && <SkeletonLoader count={3} type="card" />}

      {/* When loaded */}
      {!loading && !error && reports.length === 0 && (
        <EmptyState
          title="No Reports Found"
          message={
            search || status || category
              ? 'No reports matched your active filter query.'
              : "You haven't submitted any problems yet."
          }
          action={
            <Link to="/citizen/report">
              <GradientButton role="citizen" size="sm" icon={PlusCircle}>
                Report a Problem
              </GradientButton>
            </Link>
          }
        />
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Reports List */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B687A]">
              Report History ({reports.length})
            </h3>
            <div className="space-y-3">
              {reports.map((report) => {
                const isSelected = selectedReport && (selectedReport.id === report.id || selectedReport._id === report._id);
                return (
                  <div
                    key={report.id || report._id}
                    onClick={() => setSelectedReport(report)}
                    className={`cursor-pointer transition-all rounded-2xl ${
                      isSelected ? 'ring-2 ring-purple-500 shadow-md' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    <IncidentCard
                      incident={report}
                      role="citizen"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline & Details Drawer */}
          <div className="lg:col-span-7 sticky top-24">
            {selectedReport ? (
              <GlassCard className="p-6 sm:p-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                      #{selectedReport.referenceId || selectedReport.id?.substring(0, 8)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={selectedReport.status} size="sm" />
                      {selectedReport.priority && (
                        <PriorityBadge priority={selectedReport.priority} size="sm" />
                      )}
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-[#252238]">
                    {selectedReport.title}
                  </h2>
                </div>

                {/* Evidence Image */}
                {selectedReport.photoUrl && (
                  <div className="h-64 rounded-2xl overflow-hidden bg-gray-100 border border-[#E9E5F0]">
                    <img
                      src={selectedReport.photoUrl}
                      alt={selectedReport.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B687A] mb-1.5">
                    Problem Description
                  </h4>
                  <p className="text-sm text-[#252238] bg-[#F8F7FC] p-4 rounded-xl border border-[#E9E5F0] leading-relaxed">
                    {selectedReport.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#E9E5F0]">
                    <span className="text-gray-400 block mb-0.5">Location</span>
                    <div className="flex items-center gap-1.5 font-semibold text-[#252238]">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span className="truncate">{selectedReport.address}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#E9E5F0]">
                    <span className="text-gray-400 block mb-0.5">Reported On</span>
                    <div className="flex items-center gap-1.5 font-semibold text-[#252238]">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>
                        {selectedReport.createdAt
                          ? new Date(selectedReport.createdAt).toLocaleString()
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Map if coordinates are supplied by backend */}
                {isValidCoordinate(selectedReport.latitude, selectedReport.longitude) && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B687A] mb-2">
                      Geographic Location
                    </h4>
                    <MapContainer
                      center={{
                        lat: Number(selectedReport.latitude),
                        lng: Number(selectedReport.longitude),
                      }}
                      zoom={15}
                      interactive={true}
                      markers={[
                        {
                          id: selectedReport.id || 'selected',
                          latitude: Number(selectedReport.latitude),
                          longitude: Number(selectedReport.longitude),
                          title: selectedReport.title,
                          status: selectedReport.status,
                          priority: selectedReport.priority,
                          address: selectedReport.address,
                        },
                      ]}
                      height="200px"
                    />
                  </div>
                )}

                {/* Status Timeline */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B687A] mb-4">
                    Workflow & Resolution Timeline
                  </h4>
                  <IncidentTimeline
                    timeline={selectedReport.timeline || []}
                    currentStatus={selectedReport.status}
                  />
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-8 text-center">
                <p className="text-xs text-[#6B687A]">Select a report from the list to view its complete timeline</p>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
