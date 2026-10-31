import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export const FilterPanel = ({
  status = 'ALL',
  onStatusChange,
  category = 'ALL',
  onCategoryChange,
  priority = 'ALL',
  onPriorityChange,
  categories = [],
  onReset
}) => {
  const statuses = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'UNDER_VERIFICATION', label: 'Under Verification' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLUTION_SUBMITTED', label: 'Resolution Submitted' },
    { value: 'RESOLVED', label: 'Resolved' }
  ];

  const priorities = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'EMERGENCY', label: 'Emergency' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2 text-slate-700 font-semibold text-sm">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-blue-600 flex items-center space-x-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.name || c} value={c.name || c}>
                {c.label || c.name || c}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
