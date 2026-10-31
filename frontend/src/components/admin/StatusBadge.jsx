import React from "react";

export function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = status.toUpperCase().replace(/\s+/g, "_");

  let colorClass = "bg-slate-100 text-slate-700 border-slate-200";

  switch (normalized) {
    case "SUBMITTED":
      colorClass = "bg-blue-50 text-blue-700 border-blue-200";
      break;
    case "UNDER_VERIFICATION":
      colorClass = "bg-purple-50 text-purple-700 border-purple-200";
      break;
    case "VERIFIED":
      colorClass = "bg-cyan-50 text-cyan-800 border-cyan-200";
      break;
    case "ASSIGNED":
      colorClass = "bg-indigo-50 text-indigo-700 border-indigo-200";
      break;
    case "IN_PROGRESS":
      colorClass = "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case "RESOLUTION_SUBMITTED":
      colorClass = "bg-teal-50 text-teal-700 border-teal-200";
      break;
    case "RESOLVED":
    case "ACTIVE":
    case "PUBLISHED":
    case "COMPLIED":
      colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;
    case "REJECTED":
    case "BREACHED":
    case "FLAGGED":
    case "SUSPENDED":
      colorClass = "bg-rose-50 text-rose-700 border-rose-200";
      break;
    case "NEEDS_INFORMATION":
    case "DRAFT":
    case "INVESTIGATING":
      colorClass = "bg-orange-50 text-orange-700 border-orange-200";
      break;
    case "ESCALATED":
      colorClass = "bg-red-50 text-red-700 border-red-300 font-semibold ring-1 ring-red-300";
      break;
    case "INACTIVE":
      colorClass = "bg-slate-100 text-slate-600 border-slate-200";
      break;
    default:
      colorClass = "bg-slate-100 text-slate-700 border-slate-200";
  }

  const label = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  if (!priority) return null;

  const normalized = priority.toUpperCase();

  let colorClass = "bg-slate-100 text-slate-700 border-slate-200";

  switch (normalized) {
    case "EMERGENCY":
      colorClass = "bg-red-100 text-red-800 border-red-300 font-bold animate-pulse";
      break;
    case "HIGH":
      colorClass = "bg-rose-50 text-rose-700 border-rose-200 font-semibold";
      break;
    case "MEDIUM":
      colorClass = "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case "LOW":
      colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;
    default:
      colorClass = "bg-slate-100 text-slate-700 border-slate-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs uppercase tracking-wider border ${colorClass}`}
    >
      {priority}
    </span>
  );
}

export default StatusBadge;
