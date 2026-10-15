import React from 'react';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GradientButton } from './GradientButton';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedState = ({
  title = 'Access Restricted',
  message = 'You do not have the required role or permissions to view this dashboard section.',
  className = '',
}) => {
  const navigate = useNavigate();
  const { roleConfig } = useAuth();

  const handleReturn = () => {
    if (roleConfig?.homePath) {
      navigate(roleConfig.homePath);
    } else {
      navigate('/login');
    }
  };

  return (
    <div
      className={`min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white/70 rounded-3xl border border-[#E9E5F0] shadow-sm max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
        <ShieldX className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-[#252238] tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-[#6B687A] leading-relaxed">{message}</p>

      <div className="mt-6 flex items-center gap-3">
        <GradientButton
          onClick={handleReturn}
          icon={ArrowLeft}
          size="md"
        >
          Return to My Dashboard
        </GradientButton>
      </div>
    </div>
  );
};
