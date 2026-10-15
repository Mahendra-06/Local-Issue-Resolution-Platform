import React from 'react';
import { getStatusConfig } from '../../constants/statuses';

export const StatusBadge = ({ status, size = 'md', showDot = true, className = '' }) => {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 rounded-md gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 rounded-xl gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center border ${config.bg} ${config.text} ${config.border} ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      title={config.description || config.label}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      <span>{config.label}</span>
    </span>
  );
};
