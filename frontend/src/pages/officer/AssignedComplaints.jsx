import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Camera,
  Calendar,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { officerApi } from "../../services/api";
import StatusBadge, { PriorityBadge } from "../../components/officer/StatusBadge";
import { LoadingSkeleton, EmptyState, ErrorState, Pagination } from "../../components/officer/UIFeedback";

export function AssignedComplaints() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters from query params
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const priority = searchParams.get("priority") || "ALL";
  const category = searchParams.get("category") || "ALL";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const fetchComplaints = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await officerApi.getComplaints({
        search,
        status,
        priority,
        category,
        sort,
        page,
        limit: 10
      });
      if (res.success) {
        setComplaints(res.data || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
      } else {
        setError(res.message || "Failed to fetch assigned complaints.");
      }
    } catch (err) {
      setError(err.message || "Error communicating with complaints server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [search, status, priority, category, sort, page]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "ALL") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set("page", "1");
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assigned Complaints</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage public grievances assigned to your official department jurisdiction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/officer/assignments/new"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <span>Check New Assignments</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search by Tracking ID, Title, or Location..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">New Assignment</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLUTION_SUBMITTED">Resolution Submitted</option>
              <option value="RESOLVED">Resolved & Closed</option>
              <option value="ESCALATED">Escalated</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priority}
              onChange={(e) => updateFilter("priority", e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="priority">Sort: Highest Priority</option>
            </select>
          </div>
        </div>

        {/* Reset Filter Action */}
        {(search || status !== "ALL" || priority !== "ALL" || category !== "ALL") && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Filtering active records</span>
            <button
              onClick={handleResetFilters}
              className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {error && <ErrorState message={error} onRetry={fetchComplaints} />}

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={5} height="h-16" />
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints match your criteria"
            message="Try clearing your search query or switching status filters."
            onAction={handleResetFilters}
            actionText="Clear All Filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Complaint Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">SLA Due</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {complaints.map((c) => {
                  const isBreached = c.sla?.is_overdue;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                        <Link to={`/officer/complaints/${c.id}`} className="hover:underline">
                          {c.tracking_id}
                        </Link>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-800">
                        {c.title}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        {c.category}
                      </td>
                      <td className="py-3 px-4 max-w-[180px] truncate text-slate-500">
                        {c.location}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {c.sla ? (
                          <span
                            className={`text-[11px] font-semibold ${
                              isBreached ? "text-red-600" : "text-slate-600"
                            }`}
                          >
                            {isBreached
                              ? "BREACHED"
                              : `${c.sla.remaining_hours}h remaining`}
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/officer/complaints/${c.id}`}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Complaint Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {c.status === "ASSIGNED" && (
                            <Link
                              to="/officer/assignments/new"
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg transition shadow-2xs"
                            >
                              Accept
                            </Link>
                          )}

                          {c.status === "ACCEPTED" && (
                            <Link
                              to={`/officer/complaints/${c.id}/progress`}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold rounded-lg transition shadow-2xs"
                            >
                              Start Work
                            </Link>
                          )}

                          {c.status === "IN_PROGRESS" && (
                            <Link
                              to={`/officer/complaints/${c.id}/resolution`}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg transition shadow-2xs"
                            >
                              Submit Resolution
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => updateFilter("page", p.toString())}
        />
      </div>
    </div>
  );
}

export default AssignedComplaints;
