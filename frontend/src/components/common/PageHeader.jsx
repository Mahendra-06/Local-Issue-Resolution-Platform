import React from 'react';
import { GlassPanel } from './GlassPanel';

export const PageHeader = ({
  title,
  subtitle,
  role = null,
  badge = null,
  actions = null,
  children = null,
  className = '',
}) => {
  return (
    <GlassPanel role={role} className={`p-6 sm:p-8 mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {badge && <div className="mb-2">{badge}</div>}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252238]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm sm:text-base text-[#6B687A] max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
      {children && <div className="mt-6 pt-6 border-t border-[#E9E5F0]/60">{children}</div>}
    </GlassPanel>
  );
};
