import React from 'react';

/**
 * GlassCard - Medium Glassmorphism Card
 * Adheres to 70% solid white/neutral base with subtle border and restrained elevation
 */
export const GlassCard = ({
  children,
  className = '',
  hoverEffect = false,
  tint = null, // 'citizen' | 'staff' | 'manager' | 'admin' | null
  interactive = false,
  onClick,
  ...props
}) => {
  const tintClasses = {
    citizen: 'bg-white/90 hover:bg-[#FAF7FD] border-purple-100',
    staff: 'bg-white/90 hover:bg-[#FFFBF7] border-amber-100',
    manager: 'bg-white/90 hover:bg-[#F6FCF9] border-emerald-100',
    admin: 'bg-white/90 hover:bg-[#F7F9FF] border-indigo-100',
  };

  const selectedTint = tint ? tintClasses[tint] || 'bg-white border-[#E9E5F0]' : 'bg-white border-[#E9E5F0]';

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border shadow-[0_4px_20px_-2px_rgba(37,34,56,0.04)] backdrop-blur-md transition-all duration-200 ${selectedTint} ${
        hoverEffect ? 'hover:shadow-[0_10px_28px_-4px_rgba(37,34,56,0.08)] hover:-translate-y-0.5' : ''
      } ${interactive ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
