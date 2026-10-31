import React from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info", // 'info', 'success', 'warning', 'danger'
  onConfirm,
  onCancel,
  isLoading = false
}) {
  if (!isOpen) return null;

  const typeConfig = {
    info: {
      icon: Info,
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white"
    },
    success: {
      icon: CheckCircle,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      confirmBtn: "bg-emerald-600 hover:bg-emerald-700 text-white"
    },
    warning: {
      icon: AlertCircle,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white"
    },
    danger: {
      icon: AlertCircle,
      iconBg: "bg-red-50 text-red-600 border-red-100",
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white"
    }
  };

  const current = typeConfig[type] || typeConfig.info;
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${current.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 ${current.confirmBtn}`}
          >
            {isLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
