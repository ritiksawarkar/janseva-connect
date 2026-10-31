import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck } from 'lucide-react';

export const TrackingSearch = ({ onSearch, initialValue = '', loading = false }) => {
  const [trackingId, setTrackingId] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingId.trim() && onSearch) {
      onSearch(trackingId.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="relative flex items-center shadow-md rounded-2xl bg-white border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 transition">
        <div className="pl-4 text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
          placeholder="Enter Unique Tracking ID (e.g. JSC-2026-000001)"
          className="w-full py-3.5 px-3 text-sm md:text-base font-mono text-slate-800 placeholder:text-slate-400 outline-none"
        />
        <div className="pr-2">
          <button
            type="submit"
            disabled={!trackingId.trim() || loading}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs md:text-sm font-medium rounded-xl transition shadow-xs cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Track Status</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center space-x-1.5 mt-2.5 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Privacy-Protected: Displays public timeline and status without exposing private citizen data.</span>
      </div>
    </form>
  );
};

export default TrackingSearch;

