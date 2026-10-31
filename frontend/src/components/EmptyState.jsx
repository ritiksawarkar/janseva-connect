import React from 'react';
import { Inbox, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  message = 'There are no active complaints matching your current filters.',
  actionLabel,
  actionLink,
  onAction
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6 shadow-2xs">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-xs md:text-sm text-slate-500 mt-1.5 max-w-xs">{message}</p>

      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-xl shadow-xs transition"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}

      {actionLabel && !actionLink && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-xl shadow-xs transition cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default EmptyState;
