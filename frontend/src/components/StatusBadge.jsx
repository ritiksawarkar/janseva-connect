import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Search,
  CheckCircle2,
  Send,
  UserCheck,
  Wrench,
  FileCheck,
  CheckCheck,
  XCircle,
  HelpCircle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const statusConfig = {
  SUBMITTED: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
    label: 'Submitted'
  },
  UNDER_VERIFICATION: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Search,
    label: 'Under Verification'
  },
  VERIFIED: {
    bg: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: CheckCircle2,
    label: 'Verified'
  },
  ASSIGNED: {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Send,
    label: 'Assigned to Dept'
  },
  ACCEPTED: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: UserCheck,
    label: 'Accepted by Officer'
  },
  IN_PROGRESS: {
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Wrench,
    label: 'In Progress'
  },
  RESOLUTION_SUBMITTED: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: FileCheck,
    label: 'Resolution Submitted'
  },
  RESOLVED: {
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: CheckCheck,
    label: 'Resolved'
  },
  REJECTED: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
    label: 'Rejected'
  },
  NEEDS_INFORMATION: {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: HelpCircle,
    label: 'Needs Info'
  },
  REASSIGNED: {
    bg: 'bg-violet-50 text-violet-700 border-violet-200',
    icon: RefreshCw,
    label: 'Reassigned'
  },
  ESCALATED: {
    bg: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: AlertTriangle,
    label: 'Escalated'
  },
  REOPENED: {
    bg: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: RefreshCw,
    label: 'Reopened'
  }
};

export const StatusBadge = ({ status, size = 'md' }) => {
  const { t } = useTranslation();
  const normalized = (status || 'SUBMITTED').toUpperCase();
  const conf = statusConfig[normalized] || statusConfig.SUBMITTED;
  const Icon = conf.icon;
  const localizedLabel = t(`status.${normalized}`, conf.label);

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5 space-x-1'
    : 'text-xs md:text-sm px-2.5 py-1 space-x-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${conf.bg} ${sizeClasses} font-medium transition-all shadow-xs`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{localizedLabel}</span>
    </span>
  );
};

export default StatusBadge;
