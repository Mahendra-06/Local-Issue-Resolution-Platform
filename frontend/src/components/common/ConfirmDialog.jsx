import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { GradientButton } from './GradientButton';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning' | 'danger' | 'info' | 'success'
  role = 'citizen',
  loading = false,
  children = null,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-[#E9E5F0] shadow-2xl p-6 overflow-hidden relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-2xl shrink-0 ${
              type === 'danger'
                ? 'bg-rose-100 text-rose-700'
                : type === 'success'
                ? 'bg-emerald-100 text-emerald-700'
                : type === 'info'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {type === 'danger' && <AlertTriangle className="w-6 h-6" />}
            {type === 'warning' && <AlertTriangle className="w-6 h-6" />}
            {type === 'success' && <CheckCircle className="w-6 h-6" />}
            {type === 'info' && <Info className="w-6 h-6" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="dialog-title" className="text-lg font-bold text-[#252238]">
              {title}
            </h3>
            {message && <p className="mt-1 text-sm text-[#6B687A] leading-relaxed">{message}</p>}
          </div>
        </div>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#E9E5F0]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <GradientButton
            onClick={onConfirm}
            loading={loading}
            role={role}
            size="md"
          >
            {confirmText}
          </GradientButton>
        </div>
      </div>
    </div>
  );
};
