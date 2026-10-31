import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, AlertOctagon, Flame } from 'lucide-react';

const priorityConfig = {
  LOW: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: null,
    label: 'Low'
  },
  MEDIUM: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: null,
    label: 'Medium'
  },
  HIGH: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircle,
    label: 'High'
  },
  EMERGENCY: {
    bg: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold animate-pulse',
    icon: Flame,
    label: 'Emergency'
  }
};

export const PriorityBadge = ({ priority }) => {
  const { t } = useTranslation();
  const normalized = (priority || 'MEDIUM').toUpperCase();
  const conf = priorityConfig[normalized] || priorityConfig.MEDIUM;
  const Icon = conf.icon;
  const localizedLabel = t(`priority.${normalized}`, conf.label);

  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md border ${conf.bg} space-x-1`}
    >
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{localizedLabel}</span>
    </span>
  );
};

export default PriorityBadge;
