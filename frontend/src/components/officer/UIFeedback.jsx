import React from "react";
import { AlertTriangle, Inbox, ChevronLeft, ChevronRight, CheckCircle2, X } from "lucide-react";

export function LoadingSkeleton({ count = 3, height = "h-16" }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-slate-100 rounded-xl w-full ${height}`} />
      ))}
    </div>
  );
}

export function EmptyState({
  title = "No complaints found",
  message = "There are no records matching your current filter criteria.",
  icon: Icon = Inbox,
  actionText,
  onAction
}) {
  return (
    <div className="py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-700">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message = "Failed to load records.", onRetry }) {
  return (
    <div className="p-6 bg-red-50/50 border border-red-200 rounded-2xl text-center">
      <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
      <h4 className="text-sm font-bold text-red-700">Unable to Fetch Information</h4>
      <p className="text-xs text-red-600 mt-1 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
        >
          Retry Request
        </button>
      )}
    </div>
  );
}

export function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 bg-white">
      <p className="text-xs text-slate-500">
        Page <span className="font-semibold text-slate-700">{currentPage}</span> of{" "}
        <span className="font-semibold text-slate-700">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastNotification({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
