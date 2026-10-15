import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { GradientButton } from '../../components/common/GradientButton';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { incidentsService } from '../../api/incidentsService';
import { assignmentsService } from '../../api/assignmentsService';
import { usersService } from '../../api/usersService';
import { useToast } from '../../context/ToastContext';
import { MapContainer } from '../../components/reports/MapContainer';
import { isValidCoordinate } from '../../api/routingService';
import {
  UserPlus,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  MapPin,
  AlertCircle,
  UserCheck,
  Send
} from 'lucide-react';

export const ManagerAssignPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [unassignedIncidents, setUnassignedIncidents] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected incident to assign
  const preselectedIncidentId = searchParams.get('incidentId');
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Assignment form state
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assigning, setAssigning] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [incidentsRes, staffRes] = await Promise.allSettled([
        incidentsService.getIncidents({ status: 'reported,under_review,assigned' }),
        usersService.getUsers({ role: 'staff' }),
      ]);

      if (incidentsRes.status === 'fulfilled') {
        const incList = Array.isArray(incidentsRes.value)
          ? incidentsRes.value
          : incidentsRes.value?.data || [];
        setUnassignedIncidents(incList);

        if (preselectedIncidentId) {
          const match = incList.find((i) => i.id === preselectedIncidentId || i._id === preselectedIncidentId);
          if (match) setSelectedIncident(match);
        } else if (incList.length > 0 && !selectedIncident) {
          setSelectedIncident(incList[0]);
        }
      }

      if (staffRes.status === 'fulfilled') {
        const staffList = Array.isArray(staffRes.value)
          ? staffRes.value
          : staffRes.value?.data || [];
        setStaffMembers(staffList);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [preselectedIncidentId, selectedIncident]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedIncident) {
      toast.warning('Selection Required', 'Please choose an incident to assign.');
      return;
    }
    if (!selectedStaffId) {
      toast.warning('Staff Required', 'Please select an authorized department staff member.');
      return;
    }
    if (!instructions.trim()) {
      toast.warning('Instructions Required', 'Please provide instructions for the field technician.');
      return;
    }

    setAssigning(true);
    try {
      const result = await assignmentsService.assignTask({
        incidentId: selectedIncident.id || selectedIncident._id,
        staffId: selectedStaffId,
        instructions: instructions.trim(),
        dueDate: dueDate || undefined,
        priority: priority || selectedIncident.priority || 'medium',
      });

      toast.success(
        'Assignment Confirmed',
        `Incident #${selectedIncident.referenceId || selectedIncident.id?.substring(0, 8)} successfully assigned.`
      );

      // Reset form
      setInstructions('');
      setDueDate('');
      loadData();
    } catch (err) {
      toast.error('Assignment Failed', err.message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="manager"
        title="Assign & Reassign Remediation Work"
        subtitle="Review unassigned community reports, select authorized department field staff, and dispatch work orders with instructions and SLA targets."
      />

      {error && (
        <ErrorState
          title="Could Not Load Assignment Ledger"
          message="Failed to retrieve unassigned incidents or staff members from the API."
          error={error}
          onRetry={loadData}
          role="manager"
        />
      )}

      {loading && !error && <SkeletonLoader count={3} type="card" />}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Incidents Awaiting Assignment */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B687A]">
              Incidents Awaiting Action ({unassignedIncidents.length})
            </h3>

            {unassignedIncidents.length === 0 ? (
              <EmptyState
                title="All Incidents Assigned"
                message="No pending incidents currently need assignment in your department."
              />
            ) : (
              <div className="space-y-3">
                {unassignedIncidents.map((item) => {
                  const isSelected = selectedIncident && (selectedIncident.id === item.id || selectedIncident._id === item._id);
                  return (
                    <GlassCard
                      key={item.id || item._id}
                      tint="manager"
                      hoverEffect={true}
                      interactive={true}
                      onClick={() => setSelectedIncident(item)}
                      className={`p-4 transition-all ${
                        isSelected
                          ? 'ring-2 ring-teal-500 shadow-md border-teal-300'
                          : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          #{item.referenceId || item.id?.substring(0, 8)}
                        </span>
                        <div className="flex items-center gap-1">
                          <StatusBadge status={item.status} size="sm" />
                          <PriorityBadge priority={item.priority} size="sm" />
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-[#252238] line-clamp-1">{item.title}</h4>

                      {item.address && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#6B687A] truncate">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="truncate">{item.address}</span>
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-[#E9E5F0] flex items-center justify-between text-[11px] text-gray-500">
                        <span>Current: {item.assignedStaffName || 'Unassigned'}</span>
                        <span className="text-teal-700 font-semibold">Select to Assign →</span>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Work Order Dispatch Form */}
          <div className="lg:col-span-7 sticky top-24">
            {selectedIncident ? (
              <GlassCard className="p-6 sm:p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                      Work Order for #{selectedIncident.referenceId || selectedIncident.id?.substring(0, 8)}
                    </span>
                    <StatusBadge status={selectedIncident.status} size="sm" />
                  </div>
                  <h3 className="text-xl font-bold text-[#252238]">{selectedIncident.title}</h3>
                  <p className="text-xs text-[#6B687A] mt-1 bg-[#F8F7FC] p-3 rounded-xl border border-[#E9E5F0]">
                    {selectedIncident.description}
                  </p>

                  {/* Incident Location Map Preview */}
                  {isValidCoordinate(selectedIncident.latitude, selectedIncident.longitude) && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-[#6B687A] mb-1.5">
                        <span className="font-bold uppercase tracking-wider">Incident Location Map</span>
                        <span className="truncate max-w-[240px] font-medium text-[#252238]">
                          {selectedIncident.address}
                        </span>
                      </div>
                      <MapContainer
                        center={{
                          lat: Number(selectedIncident.latitude),
                          lng: Number(selectedIncident.longitude),
                        }}
                        zoom={15}
                        interactive={true}
                        markers={[
                          {
                            id: selectedIncident.id || 'assign-incident',
                            latitude: Number(selectedIncident.latitude),
                            longitude: Number(selectedIncident.longitude),
                            title: selectedIncident.title,
                            status: selectedIncident.status,
                            priority: selectedIncident.priority,
                            address: selectedIncident.address,
                          },
                        ]}
                        height="180px"
                        role="manager"
                      />
                    </div>
                  )}
                </div>

                <form onSubmit={handleAssign} className="space-y-4">
                  {/* Staff Select */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1.5">
                      Assign to Staff Technician <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] focus:ring-2 focus:ring-teal-400 outline-none"
                    >
                      <option value="">Select eligible department staff member...</option>
                      {staffMembers.map((staff) => (
                        <option key={staff.id || staff._id} value={staff.id || staff._id}>
                          {staff.name} — ({staff.email})
                        </option>
                      ))}
                    </select>
                    {staffMembers.length === 0 && (
                      <p className="mt-1 text-xs text-amber-700">
                        No active field staff found. You can add staff in Team or Admin Users.
                      </p>
                    )}
                  </div>

                  {/* Priority & Target Due Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1.5">
                        Priority Level
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] focus:ring-2 focus:ring-teal-400 outline-none"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="critical">Critical / Emergency</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1.5">
                        Target Resolution Due Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] focus:ring-2 focus:ring-teal-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1.5">
                      Work Order Instructions <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Specify required tools, safety precautions, materials, repair protocol, or on-site contact..."
                      className="w-full px-4 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] focus:ring-2 focus:ring-teal-400 outline-none"
                    />
                  </div>

                  <div className="pt-4 border-t border-[#E9E5F0] flex items-center justify-end">
                    <GradientButton
                      type="submit"
                      role="manager"
                      size="lg"
                      loading={assigning}
                      icon={Send}
                      iconPosition="right"
                    >
                      Dispatch Assignment
                    </GradientButton>
                  </div>
                </form>
              </GlassCard>
            ) : (
              <GlassCard className="p-8 text-center">
                <EmptyState
                  title="No Incident Selected"
                  message="Select an incident from the left queue to open the work dispatch form."
                />
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
