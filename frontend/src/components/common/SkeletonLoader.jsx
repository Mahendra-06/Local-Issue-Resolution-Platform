import React from 'react';

export const SkeletonLoader = ({ count = 3, type = 'card', className = '' }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'metric') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {items.map((i) => (
          <div
            key={i}
            className="p-6 bg-white rounded-2xl border border-[#E9E5F0] shadow-sm animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            </div>
            <div className="h-8 bg-gray-300 rounded w-16 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table-row') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 p-4 bg-gray-50/70 rounded-xl border border-gray-100 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/6" />
            <div className="h-4 bg-gray-200 rounded w-1/5" />
            <div className="h-6 bg-gray-200 rounded-lg w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((i) => (
        <div
          key={i}
          className="p-6 bg-white rounded-2xl border border-[#E9E5F0] shadow-sm animate-pulse"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="ml-auto h-5 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};
