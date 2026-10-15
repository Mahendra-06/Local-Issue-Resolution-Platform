import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { GradientButton } from './GradientButton';

export const ErrorState = ({
  title = 'Unable to Load Data',
  message = 'An unexpected error occurred while communicating with the CivicPulse server.',
  error = null,
  onRetry = null,
  role = 'citizen',
  className = '',
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`p-6 sm:p-8 rounded-2xl bg-rose-50/60 border border-rose-200/80 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-sm">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold text-[#252238] tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-[#6B687A] max-w-md leading-relaxed">{message}</p>

      {error && (
        <div className="mt-4 w-full max-w-md">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800"
          >
            <span>{showDetails ? 'Hide technical error' : 'Show technical error'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDetails && (
            <div className="mt-2 p-3 text-left bg-white/90 border border-rose-200 rounded-xl text-xs font-mono text-rose-900 overflow-x-auto shadow-inner">
              {error.message || String(error)}
              {error.status ? ` (Status: ${error.status})` : ''}
            </div>
          )}
        </div>
      )}

      {onRetry && (
        <div className="mt-6">
          <GradientButton
            onClick={onRetry}
            role={role}
            size="sm"
            icon={RefreshCw}
          >
            Retry Request
          </GradientButton>
        </div>
      )}
    </div>
  );
};
