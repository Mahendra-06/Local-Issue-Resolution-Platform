import React from 'react';
import { getPriorityConfig } from '../../constants/statuses';

export const PriorityBadge = ({ priority, size = 'md', className = '' }) => {
  const config = getPriorityConfig(priority);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-0.5 rounded-lg font-semibold',
    lg: 'text-sm px-3 py-1 rounded-xl font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center border ${config.bg} ${config.text} ${config.border} ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
    >
      {config.label}
    </span>
  );
};
