import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowUpRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import SupporterCount from './SupporterCount';

export const ComplaintTable = ({ complaints = [], isJoinedView = false, onLeave }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3 px-4">Tracking ID</th>
              <th className="py-3 px-4">Title & Category</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Community Support</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.map((c) => {
              const dateStr = new Date(c.created_at || c.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short'
              });

              return (
                <tr key={c.id} className="hover:bg-slate-50/60 transition group">
                  <td className="py-3.5 px-4 font-mono font-medium text-blue-700 whitespace-nowrap">
                    <Link to={`/citizen/complaints/${c.id}`} className="hover:underline">
                      {c.tracking_id || c.trackingId}
                    </Link>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <Link to={`/citizen/complaints/${c.id}`}>
                      <p className="font-medium text-slate-900 group-hover:text-blue-600 transition truncate">
                        {c.title}
                      </p>
                    </Link>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.category}</p>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    <p className="text-xs font-medium text-slate-800">{c.area}</p>
                    <p className="text-[11px] text-slate-400">{c.district}</p>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={c.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <PriorityBadge priority={c.priority} />
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <SupporterCount
                      count={c.supporter_count || c.supporterCount || 0}
                      hasJoined={isJoinedView}
                      size="sm"
                    />
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                    {c.department_name ? (
                      <span className="text-slate-700 font-medium truncate max-w-[150px] block">
                        {c.department_name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Under Verification</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                      {isJoinedView && onLeave && (
                        <button
                          type="button"
                          onClick={() => onLeave(c)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition"
                        >
                          Withdraw
                        </button>
                      )}
                      <Link
                        to={`/citizen/complaints/${c.id}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplaintTable;

