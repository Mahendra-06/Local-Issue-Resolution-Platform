import React from 'react';
import { GlassCard } from './GlassCard';

export const MetricCard = ({
  title,
  value,
  subtitle = null,
  icon: Icon = null,
  trend = null, // { value: '+12%', positive: true, label: 'vs last week' }
  role = null,
  onClick,
  className = '',
}) => {
  const iconRoleClasses = {
    citizen: 'bg-purple-100 text-purple-700',
    staff: 'bg-amber-100 text-amber-800',
    manager: 'bg-emerald-100 text-teal-800',
    admin: 'bg-indigo-100 text-indigo-800',
  };

  const selectedIconStyle = role ? iconRoleClasses[role] || 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700';

  return (
    <GlassCard
      tint={role}
      hoverEffect={!!onClick}
      interactive={!!onClick}
      onClick={onClick}
      className={`p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm font-medium text-[#6B687A]">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#252238] mt-1.5 tracking-tight">
            {value !== undefined && value !== null ? value : '—'}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl shrink-0 ${selectedIconStyle}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-[#E9E5F0]/60 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-semibold px-1.5 py-0.5 rounded ${
                trend.positive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {trend.value}
            </span>
          )}
          {trend?.label && <span className="text-[#6B687A]">{trend.label}</span>}
          {subtitle && !trend && <span className="text-[#6B687A]">{subtitle}</span>}
        </div>
      )}
    </GlassCard>
  );
};
