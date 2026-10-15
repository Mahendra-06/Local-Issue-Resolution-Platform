import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Lock, KeyRound } from 'lucide-react';

export const RoleSelectionCard = ({
  roleKey,
  name,
  description,
  icon: Icon,
  accentGradient,
  badgeText,
  badgeClass,
  loginPath,
  registerPath,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`relative w-full rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'bg-white border-purple-500 shadow-lg ring-2 ring-purple-100'
          : 'bg-white/80 hover:bg-white border-[#E9E5F0] hover:border-purple-300 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Icon & Info */}
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${accentGradient} shadow-md shrink-0`}
          >
            <Icon className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#252238] tracking-tight group-hover:text-purple-900 transition-colors">
                {name}
              </h3>
              {badgeText && (
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${badgeClass}`}
                >
                  {badgeText}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#6B687A] mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div
          className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {loginPath && (
            <Link
              to={loginPath}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#252238] bg-gray-50 hover:bg-gray-100 border border-gray-200/80 transition-colors flex items-center gap-1.5"
            >
              <span>Sign In</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
            </Link>
          )}

          {registerPath && (
            <Link
              to={registerPath}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${accentGradient} shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5`}
            >
              <span>
                {roleKey === 'admin'
                  ? 'Access Notice'
                  : roleKey === 'staff' || roleKey === 'manager'
                  ? 'Onboard'
                  : 'Register'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
