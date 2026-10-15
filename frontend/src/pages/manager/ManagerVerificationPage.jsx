import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { GradientButton } from '../../components/common/GradientButton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { assignmentsService } from '../../api/assignmentsService';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  User,
  Image as ImageIcon,
  MapPin,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const ManagerVerificationPage = () => {
  const toast = useToast();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected item to verify
  const [selectedItem, setSelectedItem] = useState(null);

  // Dialog actions
  const [dialogAction, setDialogAction] = useState(null); // 'approve' | 'reject'
  const [verificationNotes, setVerificationNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await assignmentsService.getVerificationQueue();
      const list = Array.isArray(response) ? response : response?.data || [];
      setQueue(list);
      if (list.length > 0 && !selectedItem) {
        setSelectedItem(list[0]);
      }
    } catch (err) {
      setError(err);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleVerify = async (approved) => {
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      await assignmentsService.verifyResolution(selectedItem.id || selectedItem._id, {
        approved,
        notes: verificationNotes || (approved ? 'Resolution approved and verified by manager.' : 'Work rejected during inspection.'),
        reopenReason: approved ? undefined : verificationNotes,
      });

      toast.success(
        approved ? 'Resolution Verified' : 'Resolution Rejected',
        approved
          ? `Incident #${selectedItem.referenceId || selectedItem.id} officially closed as Resolved.`
          : `Incident #${selectedItem.referenceId || selectedItem.id} marked as Reopened for staff rework.`
      );

      setDialogAction(null);
      setVerificationNotes('');
      setSelectedItem(null);
      fetchQueue();
    } catch (err) {
      toast.error('Verification Action Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="manager"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Quality & Resolution Verification
          </span>
        }
        title="Verification Queue"
        subtitle="Review completed field work orders, inspect photographic proof submitted by field technicians, and verify closure or order rework."
      />

      {error && (
        <ErrorState
          title="Could Not Load Verification Queue"
          message="Failed to retrieve pending verification items."
          error={error}
          onRetry={fetchQueue}
          role="manager"
        />
      )}

      {loading && !error && <SkeletonLoader count={3} type="card" />}

      {!loading && !error && queue.length === 0 && (
        <EmptyState
          icon={CheckCircle2}
          title="Verification Queue Clear"
          message="There are no completed tasks awaiting manager inspection right now. When field staff submit repair proof, it will appear here."
        />
      )}

      {!loading && !error && queue.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Queue Items */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B687A]">
              Awaiting Inspection ({queue.length})
            </h3>

            {queue.map((item) => {
              const isSelected = selectedItem && (selectedItem.id === item.id || selectedItem._id === item._id);
              return (
                <GlassCard
                  key={item.id || item._id}
                  tint="manager"
                  hoverEffect={true}
                  interactive={true}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 transition-all ${
                    isSelected ? 'ring-2 ring-teal-500 shadow-md border-teal-300' : 'opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      #{item.referenceId || item.id?.substring(0, 8)}
                    </span>
                    <StatusBadge status="pending_verification" size="sm" />
                  </div>

                  <h4 className="font-bold text-sm text-[#252238] line-clamp-1">{item.title}</h4>

                  <div className="mt-2 text-xs text-[#6B687A] flex items-center justify-between">
                    <span>Staff: <strong>{item.staffName || item.assignee?.name || 'Technician'}</strong></span>
                    <span className="text-teal-700 font-semibold">Inspect Evidence →</span>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Right Column: Evidence Inspector & Decision Controls */}
          <div className="lg:col-span-7 sticky top-24">
            {selectedItem && (
              <GlassCard className="p-6 sm:p-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                      Task #{selectedItem.referenceId || selectedItem.id?.substring(0, 8)}
                    </span>
                    <PriorityBadge priority={selectedItem.priority} size="sm" />
                  </div>
                  <h3 className="text-xl font-bold text-[#252238]">{selectedItem.title}</h3>
                </div>

                {/* Evidence Proof Photos */}
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-[#6B687A] block mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-teal-700" /> Completion Photographic Proof
                  </span>
                  {selectedItem.evidenceUrls && selectedItem.evidenceUrls.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedItem.evidenceUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="h-48 rounded-xl overflow-hidden border border-[#E9E5F0] hover:ring-2 hover:ring-teal-400 block group relative"
                        >
                          <img src={url} alt={`Proof ${i + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                            Click to View Full Size
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-[#E9E5F0] text-center text-xs text-gray-500">
                      No photographic proof attached by technician.
                    </div>
                  )}
                </div>

                {/* Staff Remediation Notes */}
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-[#6B687A] block mb-1">
                    Technician Work Notes
                  </span>
                  <p className="text-xs text-[#252238] bg-teal-50/50 p-4 rounded-xl border border-teal-100 leading-relaxed font-medium">
                    {selectedItem.notes || selectedItem.completionNotes || 'Staff submitted resolution without custom notes.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#E9E5F0]">
                    <span className="text-gray-400 block mb-0.5">Location</span>
                    <div className="flex items-center gap-1 font-semibold text-[#252238] truncate">
                      <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span className="truncate">{selectedItem.address}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E9E5F0]">
                    <span className="text-gray-400 block mb-0.5">Technician</span>
                    <div className="flex items-center gap-1 font-semibold text-[#252238]">
                      <User className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>{selectedItem.staffName || 'Field Staff'}</span>
                    </div>
                  </div>
                </div>

                {/* Manager Verification Decision Buttons */}
                <div className="pt-4 border-t border-[#E9E5F0] flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDialogAction('reject')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Work & Reopen</span>
                  </button>

                  <GradientButton
                    onClick={() => setDialogAction('approve')}
                    role="manager"
                    size="md"
                    icon={CheckCircle2}
                    className="w-full sm:w-auto"
                  >
                    Approve Resolution
                  </GradientButton>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(dialogAction)}
        onClose={() => setDialogAction(null)}
        onConfirm={() => handleVerify(dialogAction === 'approve')}
        loading={submitting}
        type={dialogAction === 'approve' ? 'success' : 'danger'}
        role="manager"
        title={
          dialogAction === 'approve'
            ? 'Confirm Incident Resolution'
            : 'Reject Resolution & Reopen Incident'
        }
        message={
          dialogAction === 'approve'
            ? 'Approving this resolution will mark the incident as Resolved, close the work order, and send a notification update to the citizen.'
            : 'Rejecting this work will move the incident back to Reopened status and notify the field technician that further remediation is required.'
        }
        confirmText={dialogAction === 'approve' ? 'Verify & Close Incident' : 'Reject & Reopen'}
      >
        <div className="mt-3">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            {dialogAction === 'approve'
              ? 'Verification Comments (Optional)'
              : 'Reason for Rejection / Reopen Instructions (Required)'}
          </label>
          <textarea
            rows={3}
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
            placeholder={
              dialogAction === 'approve'
                ? 'Inspected and certified compliant with municipal standards.'
                : 'Pavement patch is uneven; requires compaction before closure.'
            }
            className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl outline-none"
          />
        </div>
      </ConfirmDialog>
    </div>
  );
};
