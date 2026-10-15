import React from 'react';
import { ServerOff, HelpCircle, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../../api/client';

export const ServiceUnavailableState = ({
  serviceName = 'CivicPulse Backend Service',
  endpoint = null,
  description = 'This feature requires an active backend server endpoint to retrieve or persist authoritative records.',
  docsHint = 'Verify VITE_API_BASE_URL is pointing to your active CivicPulse API server.',
  className = '',
}) => {
  return (
    <div
      className={`p-6 sm:p-8 rounded-2xl bg-amber-50/60 border border-amber-200 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
        <ServerOff className="w-6 h-6" />
      </div>

      <h4 className="text-base font-bold text-[#252238]">{serviceName} Not Available</h4>
      <p className="mt-1 text-xs sm:text-sm text-[#6B687A] max-w-md leading-relaxed">
        {description}
      </p>

      <div className="mt-4 p-3 bg-white/80 rounded-xl border border-amber-200/80 text-xs text-left max-w-md w-full text-slate-700 font-mono space-y-1">
        <div>
          <span className="font-semibold text-gray-500">Target Base URL:</span>{' '}
          <span className="text-indigo-700">{API_BASE_URL}</span>
        </div>
        {endpoint && (
          <div>
            <span className="font-semibold text-gray-500">Endpoint:</span>{' '}
            <span className="text-purple-700">{endpoint}</span>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-amber-800 flex items-center gap-1">
        <HelpCircle className="w-3.5 h-3.5" />
        <span>{docsHint}</span>
      </p>
    </div>
  );
};
