import React from 'react';
import { GlassCard } from './GlassCard';
import { BarChart3 } from 'lucide-react';

export const ChartCard = ({
  title,
  subtitle,
  children,
  actions = null,
  empty = false,
  emptyMessage = 'No chart analytics data available from the backend.',
  className = '',
}) => {
  return (
    <GlassCard className={`p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-bold text-lg text-[#252238]">{title}</h3>
          {subtitle && <p className="text-xs text-[#6B687A] mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {empty ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-[#E9E5F0]">
          <BarChart3 className="w-10 h-10 text-gray-300 mb-2" />
          <p className="text-sm font-medium text-[#252238]">No Analytics Data</p>
          <p className="text-xs text-[#6B687A] max-w-xs mt-1">{emptyMessage}</p>
        </div>
      ) : (
        <div className="w-full">{children}</div>
      )}
    </GlassCard>
  );
};
