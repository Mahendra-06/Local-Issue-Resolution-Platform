import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { getCategoryById } from '../../constants/categories';
import { MapPin, Calendar, Layers, ArrowRight, Image as ImageIcon } from 'lucide-react';

export const IncidentCard = ({
  incident,
  onSelect = null,
  role = 'citizen',
  className = '',
}) => {
  if (!incident) return null;

  const category = getCategoryById(incident.categoryId || incident.category);
  const formattedDate = incident.createdAt
    ? new Date(incident.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <GlassCard
      tint={role}
      hoverEffect={!!onSelect}
      interactive={!!onSelect}
      onClick={() => onSelect && onSelect(incident)}
      className={`p-5 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={incident.status} size="sm" />
            {incident.priority && <PriorityBadge priority={incident.priority} size="sm" />}
          </div>
          <span className="text-[11px] font-mono text-gray-400">
            #{incident.referenceId || incident.id?.substring(0, 8)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-[#252238] line-clamp-2 leading-snug group-hover:text-purple-700 transition-colors">
          {incident.title}
        </h3>

        {/* Description snippet */}
        {incident.description && (
          <p className="mt-1.5 text-xs text-[#6B687A] line-clamp-2 leading-relaxed">
            {incident.description}
          </p>
        )}

        {/* Media Preview thumbnail if photo attached */}
        {(incident.photoUrl || (incident.photos && incident.photos.length > 0)) && (
          <div className="mt-3 relative h-28 w-full rounded-xl overflow-hidden bg-gray-100 border border-[#E9E5F0]">
            <img
              src={incident.photoUrl || incident.photos[0]}
              alt={incident.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>Evidence</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-[#E9E5F0]/70 flex flex-col gap-2 text-xs text-[#6B687A]">
        {incident.address && (
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{incident.address}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium text-gray-600">{category?.name || 'General'}</span>
          </div>

          {formattedDate && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        {onSelect && (
          <div className="mt-1 flex items-center justify-end text-xs font-semibold text-purple-700 gap-1 hover:gap-1.5 transition-all">
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </GlassCard>
  );
};
