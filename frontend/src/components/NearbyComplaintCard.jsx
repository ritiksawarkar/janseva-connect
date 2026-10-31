import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, ArrowRight, Heart, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import SupporterCount from './SupporterCount';

export const NearbyComplaintCard = ({
  complaint,
  onJoin,
  joiningId = null
}) => {
  const isJoining = joiningId === complaint.id;

  return (
    <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            {complaint.trackingId}
          </span>
          <div className="flex items-center space-x-1.5">
            {complaint.priority === 'EMERGENCY' && <PriorityBadge priority={complaint.priority} />}
            <StatusBadge status={complaint.status} size="sm" />
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm md:text-base font-semibold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
          {complaint.title}
        </h4>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>

        {/* Location & Distance Pill */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center space-x-1 text-xs text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100/60 font-medium">
            <Navigation className="w-3 h-3 text-blue-600" />
            <span>{complaint.distanceLabel || `${complaint.distanceKm} km away`}</span>
          </div>

          <div className="inline-flex items-center space-x-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[160px]">{complaint.area}, {complaint.district}</span>
          </div>

          <div className="text-[11px] text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
            {complaint.category}
          </div>
        </div>

        {/* Similarity explanation if present */}
        {complaint.similarityExplanation && (
          <p className="mt-2 text-[11px] text-amber-800 bg-amber-50/70 border border-amber-100/80 rounded-lg px-2.5 py-1">
            💡 {complaint.similarityExplanation}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <SupporterCount count={complaint.supporterCount} hasJoined={complaint.hasJoined} />

        <div className="flex items-center space-x-2">
          {onJoin && !complaint.isOwnComplaint && (
            <button
              type="button"
              onClick={() => onJoin(complaint)}
              disabled={isJoining || complaint.hasJoined}
              className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-xl transition cursor-pointer ${
                complaint.hasJoined
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${complaint.hasJoined ? 'fill-emerald-600 text-emerald-600' : ''}`} />
              <span>{isJoining ? 'Joining...' : complaint.hasJoined ? 'Supported' : 'Support Issue'}</span>
            </button>
          )}

          <Link
            to={`/citizen/complaints/${complaint.id}`}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NearbyComplaintCard;
