import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { ReportForm } from '../../components/reports/ReportForm';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CitizenReportPage = () => {
  const navigate = useNavigate();

  const handleSuccess = (newReport) => {
    // Navigate to user's reports list
    navigate('/citizen/reports');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Link
          to="/citizen"
          className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Citizen Home</span>
        </Link>
      </div>

      <PageHeader
        role="citizen"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5" /> Direct Municipal Routing
          </span>
        }
        title="Report a Local Problem"
        subtitle="Fill in the details below with verified coordinates and optional photos. Your report will be automatically dispatched to the authorized department manager."
      />

      <ReportForm onSuccess={handleSuccess} />
    </div>
  );
};
