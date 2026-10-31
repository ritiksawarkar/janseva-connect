import React from "react";
import { CheckCircle2, Clock, AlertCircle, FileText, Camera, Shield } from "lucide-react";

export function ComplaintTimeline({ items = [] }) {
  if (!items || items.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        No timeline events recorded yet.
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESOLVED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "RESOLUTION_SUBMITTED":
        return <Camera className="w-4 h-4 text-purple-600" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4 text-amber-600" />;
      case "ACCEPTED":
        return <CheckCircle2 className="w-4 h-4 text-indigo-600" />;
      case "ASSIGNED":
        return <Shield className="w-4 h-4 text-blue-600" />;
      case "ESCALATED":
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {items.map((event, idx) => {
        const dateStr = event.created_at
          ? new Date(event.created_at).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
          : "Timestamp unavailable";

        return (
          <div key={event.id || idx} className="relative group">
            {/* Timeline bullet */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-xs">
              {getStatusIcon(event.new_status)}
            </div>

            <div className="bg-slate-50/70 hover:bg-slate-50 transition border border-slate-200/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold text-slate-800">
                  {event.new_status ? event.new_status.replace(/_/g, " ") : "Update"}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{dateStr}</span>
              </div>

              {event.actor_name && (
                <p className="text-[11px] font-semibold text-blue-600 mb-1">
                  By: {event.actor_name} {event.actor_role ? `(${event.actor_role})` : ""}
                </p>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">{event.remarks}</p>

              {event.metadata?.photo_url && (
                <div className="mt-2">
                  <a
                    href={event.metadata.photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-[11px] text-blue-600 hover:underline gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" /> View Attached Progress Photo
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ComplaintTimeline;
