import React from 'react';
import { SearchInput } from './SearchInput';
import { Filter, RotateCcw } from 'lucide-react';
import { INCIDENT_STATUSES, STATUS_CONFIG, INCIDENT_PRIORITIES, PRIORITY_CONFIG } from '../../constants/statuses';
import { DEFAULT_CATEGORIES } from '../../constants/categories';

export const FilterBar = ({
  search,
  onSearchChange,
  status = '',
  onStatusChange = null,
  category = '',
  onCategoryChange = null,
  priority = '',
  onPriorityChange = null,
  onReset = null,
  searchPlaceholder = 'Search records...',
  categories = DEFAULT_CATEGORIES,
  className = '',
}) => {
  const hasActiveFilters = Boolean(search || status || category || priority);

  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E9E5F0] shadow-sm mb-6 ${className}`}
    >
      <div className="flex-1 min-w-[240px]">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {onStatusChange && (
          <div className="relative">
            <select
              aria-label="Filter by Status"
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="appearance-none bg-white border border-[#E9E5F0] rounded-xl px-3 py-2 pr-8 text-xs font-medium text-[#252238] focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-300 transition-all cursor-pointer shadow-sm"
            >
              <option value="">All Statuses</option>
              {Object.keys(INCIDENT_STATUSES).map((key) => {
                const val = INCIDENT_STATUSES[key];
                const conf = STATUS_CONFIG[val];
                return (
                  <option key={val} value={val}>
                    {conf.label}
                  </option>
                );
              })}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        )}

        {onCategoryChange && (
          <div className="relative">
            <select
              aria-label="Filter by Category"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="appearance-none bg-white border border-[#E9E5F0] rounded-xl px-3 py-2 pr-8 text-xs font-medium text-[#252238] focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-300 transition-all cursor-pointer shadow-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        )}

        {onPriorityChange && (
          <div className="relative">
            <select
              aria-label="Filter by Priority"
              value={priority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="appearance-none bg-white border border-[#E9E5F0] rounded-xl px-3 py-2 pr-8 text-xs font-medium text-[#252238] focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-300 transition-all cursor-pointer shadow-sm"
            >
              <option value="">All Priorities</option>
              {Object.keys(INCIDENT_PRIORITIES).map((key) => {
                const val = INCIDENT_PRIORITIES[key];
                const conf = PRIORITY_CONFIG[val];
                return (
                  <option key={val} value={val}>
                    {conf.label}
                  </option>
                );
              })}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        )}

        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            title="Reset active filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
