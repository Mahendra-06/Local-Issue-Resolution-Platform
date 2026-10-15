import React from 'react';
import { Loader2 } from 'lucide-react';

export const GradientButton = ({
  children,
  type = 'button',
  variant = 'gradient', // 'gradient' | 'outline' | 'ghost' | 'secondary'
  role = 'citizen', // 'citizen' | 'staff' | 'manager' | 'admin'
  size = 'md', // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5 font-medium',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2 font-semibold',
    lg: 'px-6 py-3.5 text-base rounded-2xl gap-2.5 font-semibold',
  };

  const roleGradients = {
    citizen: 'bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white shadow-violet-200/60',
    staff: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-amber-200/60',
    manager: 'bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white shadow-teal-200/60',
    admin: 'bg-gradient-to-r from-indigo-700 to-violet-600 hover:from-indigo-800 hover:to-violet-700 text-white shadow-indigo-200/60',
  };

  const outlineClasses = {
    citizen: 'border border-violet-200 text-violet-700 hover:bg-violet-50 bg-white/80',
    staff: 'border border-amber-200 text-amber-800 hover:bg-amber-50 bg-white/80',
    manager: 'border border-teal-200 text-teal-800 hover:bg-teal-50 bg-white/80',
    admin: 'border border-indigo-200 text-indigo-800 hover:bg-indigo-50 bg-white/80',
  };

  let variantStyle = '';
  if (variant === 'gradient') {
    variantStyle = `${roleGradients[role] || roleGradients.citizen} shadow-md`;
  } else if (variant === 'outline') {
    variantStyle = outlineClasses[role] || outlineClasses.citizen;
  } else if (variant === 'ghost') {
    variantStyle = 'text-gray-600 hover:text-gray-950 hover:bg-gray-100/60';
  } else {
    variantStyle = 'bg-white border border-[#E9E5F0] text-[#252238] hover:bg-gray-50';
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${
        sizeClasses[size] || sizeClasses.md
      } ${variantStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};
