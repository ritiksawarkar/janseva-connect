import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'blue', // 'blue' | 'rose' | 'emerald'
  loading = false
}) => {
  if (!isOpen) return null;

  const btnColors = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    rose: 'bg-rose-600 hover:bg-rose-700 text-white',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>

        <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs md:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs md:text-sm font-medium rounded-xl shadow-xs transition flex items-center space-x-1.5 ${btnColors[confirmVariant] || btnColors.blue}`}
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
