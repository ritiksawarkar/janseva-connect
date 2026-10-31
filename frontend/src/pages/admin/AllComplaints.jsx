import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { complaintsApi, departmentsApi } from "../../services/api";
import DataTable from "../../components/admin/DataTable";
import Pagination from "../../components/admin/Pagination";
import { SearchInput, FilterDropdown, ErrorState } from "../../components/admin/UIControls";
import StatusBadge, { PriorityBadge } from "../../components/admin/StatusBadge";
import { FormModal } from "../../components/admin/Modals";
import {
  FileText,
  Eye,
  CheckCircle,
  UserCheck,
  AlertTriangle,
  History,
  Calendar,
  MapPin,
  ExternalLink,
  Shield,
  Layers
} from "lucide-react";

export function AllComplaints() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [isOverdueOnly, setIsOverdueOnly] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail Modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [pagination.page, statusFilter, categoryFilter, deptFilter, priorityFilter, isOverdueOnly]);

  const fetchDepartments = async () => {
    try {
      const res = await departmentsApi.getDepartments({});
      if (res.success) setDepartments(res.data);
    } catch (e) {
      console.warn("Could not load departments filter:", e);
    }
  };

  const fetchComplaints = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await complaintsApi.getComplaints({
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: statusFilter,
        category: categoryFilter,
        department_id: deptFilter,
        priority: priorityFilter,
        is_overdue: isOverdueOnly
      });
      if (res.success) {
        setComplaints(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load complaints");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchComplaints();
  };

  const handleViewDetails = async (complaintId) => {
    try {
      const res = await complaintsApi.getComplaintById(complaintId);
      if (res.success) {
        setSelectedComplaint(res.data);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      alert("Error loading details: " + err.message);
    }
  };

  const columns = [
    {
      header: "Tracking ID",
      accessor: "tracking_id",
      render: (row) => (
        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
          {row.tracking_id}
        </span>
      )
    },
    {
      header: "Complaint Title",
      accessor: "title",
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-semibold text-slate-900 truncate" title={row.title}>
            {row.title}
          </p>
          <p className="text-[11px] text-slate-500 flex items-center mt-0.5">
            <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
            <span className="truncate">{row.location}</span>
          </p>
        </div>
      )
    },
    {
      header: "Citizen",
      accessor: "citizen_name",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.citizen_name}</p>
          <p className="text-[11px] text-slate-400">{row.citizen_phone || row.citizen_email}</p>
        </div>
      )
    },
    {
      header: "Category",
      accessor: "category",
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
          {row.category}
        </span>
      )
    },
    {
      header: "Assigned Department",
      accessor: "department_name",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.department_name}</p>
          {row.officer_name && row.officer_name !== "Unassigned" && (
            <p className="text-[10px] text-blue-600 font-medium">Officer: {row.officer_name}</p>
          )}
        </div>
      )
    },
    {
      header: "Priority",
      accessor: "priority",
      render: (row) => <PriorityBadge priority={row.priority} />
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <div className="space-y-1">
          <StatusBadge status={row.status} />
          {row.is_overdue && (
            <span className="block text-[10px] font-bold text-rose-600 uppercase tracking-tight">
              SLA Overdue
            </span>
          )}
        </div>
      )
    },
    {
      header: "Submitted",
      accessor: "created_at",
      render: (row) => (
        <span className="text-slate-500">
          {new Date(row.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short"
          })}
        </span>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => handleViewDetails(row.id)}
            title="Inspect Details"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Eye className="w-4 h-4" />
          </button>

          {row.status === "SUBMITTED" || row.status === "UNDER_VERIFICATION" ? (
            <button
              onClick={() => navigate("/admin/complaints/verification")}
              title="Verify Complaint"
              className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          ) : null}

          {row.status === "VERIFIED" ? (
            <button
              onClick={() => navigate("/admin/complaints/assignments")}
              title="Assign Department/Officer"
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          ) : null}

          <button
            onClick={() => navigate(`/admin/escalations?complaintId=${row.id}`)}
            title="Escalate Issue"
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            All Grievances & Complaints
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Master repository of citizen submissions, verification workflow, and resolution statuses.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-700">Total Grievances:</span>
          <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-bold rounded-lg">
            {pagination.total}
          </span>
        </div>
      </div>

      {/* Search and Advanced Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by Tracking ID, title description, or citizen name..."
            onClear={() => {
              setSearch("");
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={[
              { label: "All Statuses", value: "ALL" },
              { label: "Submitted", value: "SUBMITTED" },
              { label: "Under Verification", value: "UNDER_VERIFICATION" },
              { label: "Verified", value: "VERIFIED" },
              { label: "Assigned", value: "ASSIGNED" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Resolved", value: "RESOLVED" },
              { label: "Rejected", value: "REJECTED" },
              { label: "Needs Information", value: "NEEDS_INFORMATION" },
              { label: "Escalated", value: "ESCALATED" }
            ]}
          />

          <FilterDropdown
            label="Department"
            value={deptFilter}
            onChange={(val) => {
              setDeptFilter(val);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={[
              { label: "All Departments", value: "ALL" },
              ...departments.map((d) => ({ label: d.name, value: String(d.id) }))
            ]}
          />

          <FilterDropdown
            label="Priority"
            value={priorityFilter}
            onChange={(val) => {
              setPriorityFilter(val);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={[
              { label: "All Priorities", value: "ALL" },
              { label: "Emergency", value: "EMERGENCY" },
              { label: "High", value: "HIGH" },
              { label: "Medium", value: "MEDIUM" },
              { label: "Low", value: "LOW" }
            ]}
          />

          <FilterDropdown
            label="Category"
            value={categoryFilter}
            onChange={(val) => {
              setCategoryFilter(val);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={[
              { label: "All Categories", value: "ALL" },
              { label: "Garbage", value: "Garbage" },
              { label: "Potholes", value: "Potholes" },
              { label: "Water Leakage", value: "Water Leakage" },
              { label: "Streetlight", value: "Streetlight" },
              { label: "Drainage", value: "Drainage" },
              { label: "General Admin", value: "General Administration" }
            ]}
          />

          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={isOverdueOnly}
              onChange={(e) => {
                setIsOverdueOnly(e.target.checked);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span className="text-rose-600">Overdue / Escalated Only</span>
          </label>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchComplaints} />}

      {/* Main Table */}
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={complaints}
          isLoading={isLoading}
          emptyTitle="No complaints found"
          emptyDescription="No grievance records match the selected filters."
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        />
      </div>

      {/* Comprehensive Complaint Detail Modal */}
      <FormModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Grievance Dossier: ${selectedComplaint?.tracking_id}`}
        subtitle={`Submitted on ${selectedComplaint ? new Date(selectedComplaint.created_at).toLocaleString() : ""}`}
        maxWidth="max-w-3xl"
      >
        {selectedComplaint && (
          <div className="space-y-6 text-xs">
            {/* Status & Quick Action Ribbon */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <StatusBadge status={selectedComplaint.status} />
                <PriorityBadge priority={selectedComplaint.priority} />
                {selectedComplaint.is_overdue && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded">
                    SLA BREACHED
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {selectedComplaint.status === "SUBMITTED" && (
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      navigate("/admin/complaints/verification");
                    }}
                    className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700"
                  >
                    Go to Verification Desk
                  </button>
                )}
                {selectedComplaint.status === "VERIFIED" && (
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      navigate("/admin/complaints/assignments");
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                  >
                    Assign Department
                  </button>
                )}
              </div>
            </div>

            {/* Description & Evidence */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Citizen Report
              </h4>
              <h3 className="text-sm font-bold text-slate-900">{selectedComplaint.title}</h3>
              <p className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Evidence photos if available */}
            {selectedComplaint.evidence_urls && selectedComplaint.evidence_urls.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Uploaded Evidence Artifacts
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedComplaint.evidence_urls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block w-40 h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0"
                    >
                      <img
                        src={url}
                        alt="Evidence"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded">
                        View Full
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Citizen & Department Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <h5 className="font-bold text-slate-800 uppercase text-[10px] text-slate-400">
                  Complainant Citizen
                </h5>
                <p className="font-semibold text-slate-900">{selectedComplaint.citizen?.full_name || "Citizen"}</p>
                <p className="text-slate-600">{selectedComplaint.citizen?.email}</p>
                <p className="text-slate-600">{selectedComplaint.citizen?.phone}</p>
                <p className="text-slate-500 font-medium pt-1">
                  Community Supporters: {selectedComplaint.supporters_count || 0} citizens
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <h5 className="font-bold text-slate-800 uppercase text-[10px] text-slate-400">
                  Department & Officer Routing
                </h5>
                <p className="font-semibold text-slate-900">
                  {selectedComplaint.department?.name || "Unassigned"}
                </p>
                <p className="text-slate-600">
                  Assigned Officer: {selectedComplaint.officer?.full_name || "Pending officer assignment"}
                </p>
                <p className="text-slate-600">
                  Location: {selectedComplaint.location}
                </p>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3 flex items-center">
                <History className="w-4 h-4 mr-1 text-slate-400" />
                Audit Trail & Status Progression
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedComplaint.history?.map((h, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800">
                          {h.old_status ? `${h.old_status} → ${h.new_status}` : h.new_status}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{h.remarks || "No remarks provided."}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(h.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}

export default AllComplaints;
