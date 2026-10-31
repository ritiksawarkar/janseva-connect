import React from 'react';
import {
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  Wrench,
  FileCheck,
  CheckCheck,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  XCircle
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const eventIcons = {
  SUBMITTED: Clock,
  UNDER_VERIFICATION: Clock,
  VERIFIED: CheckCircle2,
  ASSIGNED: Send,
  ACCEPTED: UserCheck,
  IN_PROGRESS: Wrench,
  RESOLUTION_SUBMITTED: FileCheck,
  RESOLVED: CheckCheck,
  REJECTED: XCircle,
  NEEDS_INFORMATION: HelpCircle,
  REASSIGNED: RefreshCw,
  ESCALATED: AlertCircle
};

export const ComplaintTimeline = ({ timeline = [], currentStatus = 'SUBMITTED' }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
        Timeline history will appear as the grievance progresses through department review.
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {timeline.map((entry, idx) => {
        const isLatest = idx === timeline.length - 1;
        const Icon = eventIcons[entry.newStatus] || Clock;
        const dateStr = new Date(entry.timestamp).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <div key={entry.id || idx} className="relative group">
            {/* Dot / Icon */}
            <div
              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 ${
                isLatest
                  ? 'bg-blue-600 text-white border-blue-200 shadow-xs ring-4 ring-blue-50'
                  : 'bg-white text-slate-500 border-slate-300'
              }`}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>

            {/* Content Card */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isLatest
                  ? 'bg-blue-50/40 border-blue-200/80 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs md:text-sm font-semibold text-slate-900">
                    {entry.actionTitle}
                  </h4>
                  <StatusBadge status={entry.newStatus} size="sm" />
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {dateStr}
                </span>
              </div>

              {entry.remarks && (
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  {entry.remarks}
                </p>
              )}

              {entry.actor && entry.actor.name && (
                <div className="mt-2 text-[11px] text-slate-400 flex items-center space-x-1">
                  <span>Updated by:</span>
                  <span className="font-medium text-slate-600">{entry.actor.name}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComplaintTimeline;

