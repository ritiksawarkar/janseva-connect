import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Building2, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import SupporterCount from './SupporterCount';

export const ComplaintCard = ({ complaint, isJoinedView = false, onLeave }) => {
  const formattedDate = new Date(complaint.created_at || complaint.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              {complaint.tracking_id || complaint.trackingId}
            </span>
            <PriorityBadge priority={complaint.priority} />
          </div>
          <StatusBadge status={complaint.status} size="sm" />
        </div>

        <Link to={`/citizen/complaints/${complaint.id}`}>
          <h3 className="text-sm md:text-base font-semibold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
            {complaint.title}
          </h3>
        </Link>

        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>

        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{complaint.area}, {complaint.district}</span>
          </span>

          <span className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-lg text-slate-600">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{formattedDate}</span>
          </span>

          {complaint.department_name && (
            <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
              <Building2 className="w-3 h-3 text-blue-500" />
              <span className="truncate max-w-[140px]">{complaint.department_name}</span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <SupporterCount
          count={complaint.supporter_count || complaint.supporterCount || 0}
          hasJoined={isJoinedView}
        />

        <div className="flex items-center space-x-2">
          {isJoinedView && onLeave && (
            <button
              type="button"
              onClick={() => onLeave(complaint)}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1 rounded-lg hover:bg-rose-50 transition"
            >
              Withdraw Support
            </button>
          )}

          <Link
            to={`/citizen/complaints/${complaint.id}`}
            className="inline-flex items-center space-x-1 text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;

