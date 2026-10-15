import React from 'react';

/**
 * GlassPanel - Translucent panel for hero headers, filter bars, and contextual overlays
 */
export const GlassPanel = ({
  children,
  className = '',
  role = null, // 'citizen' | 'staff' | 'manager' | 'admin' | null
  ...props
}) => {
  const roleGradients = {
    citizen: 'bg-gradient-to-br from-purple-50/70 via-white/80 to-pink-50/50 border-purple-100/80',
    staff: 'bg-gradient-to-br from-amber-50/70 via-white/80 to-orange-50/50 border-amber-100/80',
    manager: 'bg-gradient-to-br from-emerald-50/70 via-white/80 to-teal-50/50 border-teal-100/80',
    admin: 'bg-gradient-to-br from-indigo-50/70 via-white/80 to-violet-50/50 border-indigo-100/80',
  };

  const panelStyle = role ? roleGradients[role] : 'bg-white/75 border-[#E9E5F0]/80';

  return (
    <div
      className={`rounded-2xl border backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.03)] ${panelStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
