import React from "react";

export function StatusBadge({ status }) {
  const normalized = status ? status.toUpperCase() : "SUBMITTED";

  const config = {
    ASSIGNED: {
      label: "New Assignment",
      className: "bg-blue-50 text-blue-700 border-blue-200"
    },
    ACCEPTED: {
      label: "Accepted",
      className: "bg-indigo-50 text-indigo-700 border-indigo-200"
    },
    IN_PROGRESS: {
      label: "In Progress",
      className: "bg-amber-50 text-amber-700 border-amber-200"
    },
    RESOLUTION_SUBMITTED: {
      label: "Resolution Submitted",
      className: "bg-purple-50 text-purple-700 border-purple-200"
    },
    RESOLVED: {
      label: "Resolved & Closed",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    ESCALATED: {
      label: "Escalated",
      className: "bg-rose-50 text-rose-700 border-rose-200"
    },
    VERIFIED: {
      label: "Verified",
      className: "bg-cyan-50 text-cyan-700 border-cyan-200"
    },
    UNDER_VERIFICATION: {
      label: "Under Verification",
      className: "bg-slate-100 text-slate-700 border-slate-200"
    },
    SUBMITTED: {
      label: "Submitted",
      className: "bg-slate-100 text-slate-700 border-slate-200"
    }
  };

  const current = config[normalized] || {
    label: normalized.replace(/_/g, " "),
    className: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {current.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const normalized = priority ? priority.toUpperCase() : "MEDIUM";

  const config = {
    EMERGENCY: {
      label: "Emergency",
      className: "bg-red-50 text-red-700 border-red-200 font-bold"
    },
    HIGH: {
      label: "High",
      className: "bg-orange-50 text-orange-700 border-orange-200"
    },
    MEDIUM: {
      label: "Medium",
      className: "bg-blue-50 text-blue-700 border-blue-200"
    },
    LOW: {
      label: "Low",
      className: "bg-slate-100 text-slate-700 border-slate-200"
    }
  };

  const current = config[normalized] || config.MEDIUM;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${current.className}`}
    >
      {current.label}
    </span>
  );
}

export default StatusBadge;
