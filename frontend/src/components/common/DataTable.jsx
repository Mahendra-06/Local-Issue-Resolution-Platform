import React from 'react';
import { GlassCard } from './GlassCard';
import { EmptyState } from './EmptyState';
import { SkeletonLoader } from './SkeletonLoader';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyMessage = 'There are no records matching your current filter criteria.',
  emptyAction = null,
  keyField = 'id',
  onRowClick = null,
  className = '',
}) => {
  if (loading) {
    return (
      <GlassCard className="p-6">
        <SkeletonLoader count={5} type="table-row" />
      </GlassCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <GlassCard className="p-4">
        <EmptyState
          title={emptyTitle}
          message={emptyMessage}
          action={emptyAction}
        />
      </GlassCard>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-[#E9E5F0] bg-white shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E9E5F0] bg-[#F8F7FC]/70">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`py-3.5 px-4 text-xs font-bold text-[#6B687A] uppercase tracking-wider ${
                    col.headerClassName || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9E5F0]/70 text-sm">
            {data.map((item, rowIdx) => {
              const rowKey = item[keyField] || item.id || item._id || rowIdx;
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer hover:bg-purple-50/30' : 'hover:bg-gray-50/50'
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={`py-3.5 px-4 text-[#252238] ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(item, rowIdx) : item[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
