import React from "react";
import { Search, AlertCircle, Inbox, Loader2 } from "lucide-react";

export function SearchInput({ value, onChange, placeholder = "Search records...", onClear }) {
  return (
    <div className="relative flex-1 min-w-[220px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
      />
      {value && (
        <button
          onClick={onClear || (() => onChange(""))}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function FilterDropdown({ label, value, onChange, options = [] }) {
  return (
    <div className="flex items-center space-x-1.5">
      {label && <label className="text-xs font-medium text-slate-600 whitespace-nowrap">{label}:</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function LoadingSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse space-y-3 p-4 bg-white rounded-xl border border-slate-200">
      <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          {[...Array(columns)].map((_, j) => (
            <div key={j} className="h-4 bg-slate-100 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title = "No records found", description = "Try adjusting your filters or search query.", icon: Icon = Inbox, actionButton }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200">
      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
}

export function ErrorState({ title = "Failed to load data", message = "An error occurred while connecting to backend APIs.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 border border-rose-200 rounded-xl">
      <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
      <h4 className="text-sm font-semibold text-rose-800">{title}</h4>
      <p className="mt-1 text-xs text-rose-600 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
