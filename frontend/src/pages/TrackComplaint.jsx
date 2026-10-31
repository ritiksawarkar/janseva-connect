import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { trackComplaint } from '../services/complaintService';
import TrackingSearch from '../components/TrackingSearch';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SupporterCount from '../components/SupporterCount';
import ComplaintTimeline from '../components/ComplaintTimeline';
import ErrorState from '../components/ErrorState';
import { useToast } from '../context/ToastContext';
import {
  Search,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const TrackComplaint = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const queryId = searchParams.get('id') || '';
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (idToSearch) => {
    if (!idToSearch) return;
    setLoading(true);
    setError(null);
    setComplaint(null);
    setSearchParams({ id: idToSearch });

    try {
      const res = await trackComplaint(idToSearch);
      if (res.success) {
        setComplaint(res.data);
      }
    } catch (err) {
      console.error('Tracking lookup error:', err);
      setError(
        err.response?.data?.message ||
        `No complaint found matching "${idToSearch}". Please check the ID and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      handleSearch(queryId);
    }
  }, [queryId]);

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      {/* Title & Search Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Public Grievance Tracker</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Grievance Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Enter your unique Tracking ID (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">JSC-2026-000001</code>) to view live progress.
        </p>

        <div className="pt-2">
          <TrackingSearch
            initialValue={queryId}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorState message={error} onRetry={() => handleSearch(queryId)} />
      )}

      {/* Tracking Result Card */}
      {complaint && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-200">
          {/* Main Status Summary */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Unique Tracking ID
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-blue-700 mt-0.5 block">
                  {complaint.trackingId}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} size="md" />
              </div>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {complaint.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Quick Details Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[11px] block">General Area</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {complaint.generalArea}, {complaint.state}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[11px] block">Assigned Department</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                  {complaint.departmentName}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[11px] block">Community Support</span>
                <div className="mt-1">
                  <SupporterCount count={complaint.supporterCount} size="sm" />
                </div>
              </div>
            </div>

            {/* Resolution notice if resolved */}
            {complaint.status === 'RESOLVED' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5 text-xs text-emerald-950">
                <div className="flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Grievance Resolution</span>
                </div>
                {complaint.resolutionNotes && (
                  <p className="leading-relaxed">{complaint.resolutionNotes}</p>
                )}
                {complaint.resolvedAt && (
                  <p className="text-[11px] text-emerald-700">
                    Resolved Date: {new Date(complaint.resolvedAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Resolution Timeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official status changes recorded on the central registry.
              </p>
            </div>

            <ComplaintTimeline
              timeline={complaint.timeline}
              currentStatus={complaint.status}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackComplaint;

