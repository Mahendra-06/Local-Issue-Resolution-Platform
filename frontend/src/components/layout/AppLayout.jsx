import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavigation } from '../navigation/TopNavigation';
import { Building2, Shield, Heart, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../../api/client';

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FC] text-[#252238]">
      <TopNavigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-[#E9E5F0] bg-white/70 backdrop-blur-sm text-xs text-[#6B687A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-[#252238]">CivicPulse Platform</span>
            <span>—</span>
            <span>Local Problem Reporting & Resolution</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Backend Connected:</span>
              <code className="text-[11px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                {API_BASE_URL}
              </code>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
