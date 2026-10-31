import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Camera,
  Search,
  Filter,
  Eye,
  Calendar,
  Layers,
  Building2,
  ExternalLink,
  X
} from "lucide-react";
import { officerApi } from "../../services/api";
import StatusBadge, { PriorityBadge } from "../../components/officer/StatusBadge";
import { LoadingSkeleton, EmptyState, ErrorState, Pagination } from "../../components/officer/UIFeedback";

export function CompletedComplaints() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [completedList, setCompletedList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const category = searchParams.get("category") || "ALL";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const fetchCompleted = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await officerApi.getCompletedComplaints({
        search,
        status,
        category,
        page,
        limit: 10
      });
      if (res.success) {
        setCompletedList(res.data || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
      } else {
        setError(res.message || "Failed to load completed complaints.");
      }
    } catch (err) {
      setError(err.message || "Error communicating with server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompleted();
  }, [search, status, category, page]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Completed Work & Closure Log</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit log of resolutions submitted and complaints officially closed by platform administration
          </p>
        </div>

        <Link
          to="/officer/complaints"
          className="text-xs text-slate-600 hover:text-blue-600 font-semibold"
        >
          ← View Active Queue
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search by Tracking ID or Title..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Completion States</option>
              <option value="RESOLUTION_SUBMITTED">Resolution Submitted (Pending Admin Review)</option>
              <option value="RESOLVED">Resolved & Closed (Admin Approved)</option>
            </select>
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="Garbage">Garbage & Sanitation</option>
              <option value="Potholes">Potholes & Roads</option>
              <option value="Water Leakage">Water Supply</option>
              <option value="Streetlight">Electrical & Streetlights</option>
              <option value="Drainage">Drainage & Stormwater</option>
            </select>
          </div>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchCompleted} />}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={4} height="h-16" />
          </div>
        ) : completedList.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No completed work records found"
            message="Complaints will appear here once you submit resolution evidence or when closed by admin."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Complaint Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Submission / Resolution Date</th>
                  <th className="py-3 px-4">Workflow Status</th>
                  <th className="py-3 px-4">Admin Closure</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {completedList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      <Link to={`/officer/complaints/${item.id}`} className="hover:underline">
                        {item.tracking_id}
                      </Link>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-800">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(item.resolution_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.status === "RESOLVED" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          Approved & Closed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">
                          Pending Admin Sign-off
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingItem(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition"
                        >
                          View Resolution
                        </button>
                        <Link
                          to={`/officer/complaints/${item.id}`}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                          title="Full Complaint Page"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Modal to view submitted resolution and photographic evidence */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl p-6 relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setViewingItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {viewingItem.tracking_id}
              </span>
              <StatusBadge status={viewingItem.status} />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {viewingItem.resolution?.resolution_title || viewingItem.title}
            </h3>

            {viewingItem.resolution && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Work Completion Details:
                </p>
                <p className="text-slate-700 leading-relaxed">
                  {viewingItem.resolution.resolution_description}
                </p>
                {viewingItem.resolution.officer_remarks && (
                  <p className="text-slate-500 italic pt-1 border-t border-slate-200">
                    Officer Remarks: {viewingItem.resolution.officer_remarks}
                  </p>
                )}
                {viewingItem.resolution.review_remarks && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                    <span className="font-bold">Admin Sign-off: </span>
                    <span>{viewingItem.resolution.review_remarks}</span>
                  </div>
                )}
              </div>
            )}

            {/* Evidence photos */}
            {viewingItem.evidence && viewingItem.evidence.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Photographic Evidence:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {viewingItem.evidence.map((ev) => (
                    <div key={ev.id} className="relative rounded-xl border border-slate-200 overflow-hidden">
                      <img
                        src={ev.storage_key}
                        alt={ev.file_name}
                        className="w-full h-44 object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800";
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {ev.evidence_type} Photograph
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompletedComplaints;
