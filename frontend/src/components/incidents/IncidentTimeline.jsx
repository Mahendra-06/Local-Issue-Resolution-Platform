import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { CheckCircle2, Clock, User, FileText, ArrowRight, Image as ImageIcon } from 'lucide-react';

export const IncidentTimeline = ({
  timeline = [],
  currentStatus = 'reported',
  className = '',
}) => {
  // If backend doesn't provide explicit timeline array, show current status milestone
  const displayItems = timeline && timeline.length > 0 ? timeline : [
    {
      status: currentStatus,
      title: 'Current Status',
      timestamp: new Date().toISOString(),
      notes: 'Authoritative server status',
    },
  ];

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E9E5F0] ${className}`}>
      {displayItems.map((event, idx) => {
        const dateStr = event.timestamp || event.createdAt
          ? new Date(event.timestamp || event.createdAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : null;

        const isLatest = idx === displayItems.length - 1;

        return (
          <div key={event.id || idx} className="relative group">
            {/* Timeline milestone node */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                isLatest
                  ? 'border-purple-600 ring-4 ring-purple-100'
                  : 'border-gray-300'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isLatest ? 'bg-purple-600' : 'bg-gray-400'
                }`}
              />
            </div>

            <div className="bg-white/80 border border-[#E9E5F0] rounded-xl p-4 shadow-sm backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {event.status && <StatusBadge status={event.status} size="sm" />}
                  <span className="font-semibold text-sm text-[#252238]">
                    {event.title || event.action || 'Status Transition'}
                  </span>
                </div>
                {dateStr && (
                  <span className="text-xs text-[#6B687A] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {dateStr}
                  </span>
                )}
              </div>

              {event.actorName && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <User className="w-3 h-3 text-gray-400" />
                  <span>
                    Action by: <strong className="text-gray-700">{event.actorName}</strong>
                    {event.actorRole ? ` (${event.actorRole})` : ''}
                  </span>
                </div>
              )}

              {event.notes && (
                <p className="text-xs text-[#6B687A] mt-2 bg-[#F8F7FC] p-2.5 rounded-lg border border-[#E9E5F0] leading-relaxed">
                  {event.notes}
                </p>
              )}

              {/* Resolution / Completion Evidence preview */}
              {event.evidenceUrls && event.evidenceUrls.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Completion Evidence
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {event.evidenceUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-16 h-16 rounded-lg overflow-hidden border border-[#E9E5F0] hover:ring-2 hover:ring-purple-400 transition-all block"
                      >
                        <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
