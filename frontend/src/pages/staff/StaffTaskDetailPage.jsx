import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { IncidentTimeline } from '../../components/incidents/IncidentTimeline';
import { PhotoUploader } from '../../components/reports/PhotoUploader';
import { GradientButton } from '../../components/common/GradientButton';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { assignmentsService } from '../../api/assignmentsService';
import { useToast } from '../../context/ToastContext';
import { MapContainer } from '../../components/reports/MapContainer';
import { routingService, isValidCoordinate } from '../../api/routingService';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Send,
  Play,
  CheckCircle,
  FileText,
  AlertCircle,
  Image as ImageIcon,
  Navigation,
  RotateCcw,
  Compass,
  Clock,
} from 'lucide-react';

export const StaffTaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Work note input
  const [workNotes, setWorkNotes] = useState('');
  const [submittingProgress, setSubmittingProgress] = useState(false);

  // Evidence file upload for verification submission
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // OSRM Driving route state
  const [routeData, setRouteData] = useState(null);
  const [staffLocation, setStaffLocation] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);

  const handleRouteToTask = () => {
    if (!navigator.geolocation) {
      setRouteError('Geolocation is not supported by your browser.');
      return;
    }
    setCalculatingRoute(true);
    setRouteError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setStaffLocation([lat, lng]);
        try {
          const route = await routingService.getDrivingRoute({
            startLat: lat,
            startLng: lng,
            endLat: Number(task.latitude),
            endLng: Number(task.longitude),
          });
          setRouteData(route);
        } catch (err) {
          setRouteError(err.message || 'Could not calculate road route.');
        } finally {
          setCalculatingRoute(false);
        }
      },
      (err) => {
        setCalculatingRoute(false);
        if (err.code === err.PERMISSION_DENIED) {
          setRouteError('Location access was denied. Please grant permission to route from your GPS.');
        } else {
          setRouteError(`GPS location unavailable: ${err.message}`);
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const fetchTaskDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentsService.getTaskById(id);
      setTask(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  // Permitted transition: Start Work (Assigned -> In Progress)
  const handleStartWork = async () => {
    setSubmittingProgress(true);
    try {
      const updated = await assignmentsService.updateProgress(id, {
        status: 'in_progress',
        notes: workNotes || 'Field staff commenced remediation work.',
      });
      toast.success('Task Started', 'Status successfully updated to In Progress.');
      setTask((prev) => ({
        ...prev,
        status: 'in_progress',
        ...(updated || {}),
      }));
      setWorkNotes('');
    } catch (err) {
      toast.error('Progress Update Failed', err.message);
    } finally {
      setSubmittingProgress(false);
    }
  };

  // Submit Work for Verification (In Progress -> Pending Verification)
  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!verificationNotes.trim()) {
      toast.warning('Notes Required', 'Please document the remediation steps completed.');
      return;
    }

    setSubmittingVerification(true);
    try {
      let uploadedUrl = null;
      if (evidenceFile) {
        try {
          const uploadRes = await assignmentsService.uploadEvidencePhoto(evidenceFile);
          uploadedUrl = uploadRes?.url || uploadRes?.photoUrl || null;
        } catch (uploadErr) {
          console.warn('Evidence upload error:', uploadErr);
        }
      }

      const result = await assignmentsService.submitForVerification(id, {
        notes: verificationNotes.trim(),
        evidenceUrls: uploadedUrl ? [uploadedUrl] : [],
        completionTime: new Date().toISOString(),
      });

      toast.success(
        'Submitted for Verification',
        'Your completed remediation work has been submitted to the Department Manager for verification.'
      );

      setTask((prev) => ({
        ...prev,
        status: 'pending_verification',
        ...(result || {}),
      }));
      setVerificationNotes('');
      setEvidenceFile(null);
      setEvidencePreview(null);
    } catch (err) {
      toast.error('Submission Failed', err.message);
    } finally {
      setSubmittingVerification(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <SkeletonLoader count={3} type="card" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorState
          title="Task Unavailable"
          message="Could not load details for this assignment."
          error={error}
          onRetry={fetchTaskDetails}
          role="staff"
        />
      </div>
    );
  }

  const currentStatus = task.status?.toLowerCase();
  const canStartWork = currentStatus === 'assigned';
  const canSubmitVerification = currentStatus === 'in_progress' || currentStatus === 'reopened';
  const isAwaitingVerification = currentStatus === 'pending_verification';
  const isResolved = currentStatus === 'resolved';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/staff/tasks"
          className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Task Queue</span>
        </Link>
      </div>

      <PageHeader
        role="staff"
        badge={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
              Task #{task.referenceId || task.id?.substring(0, 8)}
            </span>
            <StatusBadge status={task.status} size="sm" />
            <PriorityBadge priority={task.priority} size="sm" />
          </div>
        }
        title={task.title || task.incidentTitle}
        subtitle="Review incident specifics, update progress, and upload repair evidence for manager verification."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Task Overview & Evidence */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-bold text-base text-[#252238]">Incident Details</h3>

            {task.photoUrl && (
              <div className="h-64 rounded-2xl overflow-hidden bg-gray-100 border border-[#E9E5F0]">
                <img
                  src={task.photoUrl}
                  alt={task.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Citizen Description
              </span>
              <p className="text-xs text-[#252238] bg-[#F8F7FC] p-3.5 rounded-xl border border-[#E9E5F0] leading-relaxed">
                {task.description || 'No description attached.'}
              </p>
            </div>

            {task.instructions && (
              <div>
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1">
                  Manager Instructions
                </span>
                <p className="text-xs text-amber-950 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 leading-relaxed font-medium">
                  {task.instructions}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl border border-[#E9E5F0] bg-white">
                <span className="text-gray-400 block mb-0.5">Location</span>
                <div className="flex items-center gap-1 text-[#252238] font-semibold truncate">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{task.address || 'Address listed'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#E9E5F0] bg-white">
                <span className="text-gray-400 block mb-0.5">Target Due Date</span>
                <div className="flex items-center gap-1 text-[#252238] font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}</span>
                </div>
              </div>
            </div>

            {/* Map and Routing Section */}
            {isValidCoordinate(task.latitude, task.longitude) && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Incident Map & Driving Route
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRouteToTask}
                      disabled={calculatingRoute}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 transition-colors cursor-pointer"
                    >
                      <Navigation className={`w-3 h-3 ${calculatingRoute ? 'animate-spin' : ''}`} />
                      <span>{calculatingRoute ? 'Routing...' : 'Route from My Location'}</span>
                    </button>
                    {routeData && (
                      <button
                        type="button"
                        onClick={() => setRouteData(null)}
                        className="text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer"
                        title="Clear route"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {routeError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center justify-between">
                    <span>{routeError}</span>
                    <button
                      type="button"
                      onClick={handleRouteToTask}
                      className="font-bold underline text-[11px] ml-2"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <MapContainer
                  center={{
                    lat: Number(task.latitude),
                    lng: Number(task.longitude),
                  }}
                  zoom={14}
                  interactive={true}
                  markers={[
                    {
                      id: task.id || 'current-task',
                      latitude: Number(task.latitude),
                      longitude: Number(task.longitude),
                      title: task.title || task.incidentTitle,
                      status: task.status,
                      priority: task.priority,
                      address: task.address,
                    },
                  ]}
                  route={routeData}
                  originPoint={staffLocation}
                  height="220px"
                  role="staff"
                />
              </div>
            )}
          </GlassCard>

          {/* Workflow Timeline */}
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-bold text-base text-[#252238]">Assignment Timeline</h3>
            <IncidentTimeline
              timeline={task.timeline || []}
              currentStatus={task.status}
            />
          </GlassCard>
        </div>

        {/* Right Column: Execution Controls & Verification Submission */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          {/* Action 1: Start Work (If Assigned) */}
          {canStartWork && (
            <GlassCard className="p-6 border-amber-200 bg-amber-50/40 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Play className="w-4 h-4" />
                <span>Begin Remediation Work</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Clicking start will mark this task as "In Progress" in the department ledger and
                notify the manager that you have commenced on-site work.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Optional Commencing Note
                </label>
                <input
                  type="text"
                  value={workNotes}
                  onChange={(e) => setWorkNotes(e.target.value)}
                  placeholder="e.g. Arrived on site with repair crew and equipment"
                  className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl outline-none"
                />
              </div>

              <GradientButton
                onClick={handleStartWork}
                role="staff"
                size="md"
                loading={submittingProgress}
                icon={Play}
                className="w-full"
              >
                Mark as In Progress
              </GradientButton>
            </GlassCard>
          )}

          {/* Action 2: Submit for Verification (If In Progress) */}
          {canSubmitVerification && (
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#252238] font-bold text-sm">
                <Send className="w-4 h-4 text-amber-600" />
                <span>Submit Work for Verification</span>
              </div>
              <p className="text-xs text-[#6B687A] leading-relaxed">
                Document what was repaired and attach completion proof photos. The Department
                Manager will verify your work before closing the incident.
              </p>

              <form onSubmit={handleSubmitVerification} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
                    Remediation Notes <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Describe how the issue was fixed, materials used, and current condition..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E9E5F0] rounded-xl text-[#252238] focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <PhotoUploader
                  onFileSelect={(file, previewUrl) => {
                    setEvidenceFile(file);
                    setEvidencePreview(previewUrl);
                  }}
                  previewUrl={evidencePreview}
                  disabled={submittingVerification}
                />

                <GradientButton
                  type="submit"
                  role="staff"
                  size="md"
                  loading={submittingVerification}
                  icon={Send}
                  iconPosition="right"
                  className="w-full"
                >
                  Submit for Verification
                </GradientButton>
              </form>
            </GlassCard>
          )}

          {/* Status Alert if Pending Verification */}
          {isAwaitingVerification && (
            <div className="p-5 rounded-2xl bg-violet-50 border border-violet-200 text-violet-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Clock className="w-4 h-4 text-violet-700" />
                <span>Pending Manager Inspection</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                You have submitted this work for review. The Department Manager is verifying the
                remediation evidence and will either approve resolution or request additional work.
              </p>
            </div>
          )}

          {/* Status Alert if Resolved */}
          {isResolved && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Incident Officially Resolved</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                The Department Manager has verified and closed this incident.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
