import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { GradientButton } from '../../components/common/GradientButton';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-[#252238] tracking-tight">Page Not Found</h1>
      <p className="mt-2 text-sm text-[#6B687A] max-w-sm">
        The requested CivicPulse page or route does not exist or has been relocated.
      </p>

      <div className="mt-6">
        <Link to="/">
          <GradientButton icon={ArrowLeft} size="md">
            Return to Home
          </GradientButton>
        </Link>
      </div>
    </div>
  );
};
