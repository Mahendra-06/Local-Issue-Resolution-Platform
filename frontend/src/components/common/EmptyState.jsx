import React from 'react';
import { Inbox, FileQuestion } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  message = 'There are no active records in the system right now.',
  action = null,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 rounded-2xl bg-[#F8F7FC]/50 border border-dashed border-[#E9E5F0] ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white border border-[#E9E5F0] shadow-sm flex items-center justify-center text-[#6B687A] mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base sm:text-lg font-bold text-[#252238] tracking-tight">{title}</h4>
      <p className="mt-1.5 text-xs sm:text-sm text-[#6B687A] max-w-sm leading-relaxed">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
