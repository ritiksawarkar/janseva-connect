import React, { useState, useEffect } from "react";
import { citizensApi } from "../../services/api";
import DataTable from "../../components/admin/DataTable";
import Pagination from "../../components/admin/Pagination";
import { SearchInput, FilterDropdown, ErrorState } from "../../components/admin/UIControls";
import StatusBadge from "../../components/admin/StatusBadge";
import { ConfirmationModal, FormModal } from "../../components/admin/Modals";
import {
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  FileText
} from "lucide-react";

export function CitizenManagement() {
  const [citizens, setCitizens] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusAction, setStatusAction] = useState({ id: null, nextStatus: "" });
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchCitizens();
  }, [pagination.page, statusFilter]);

  const fetchCitizens = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await citizensApi.getCitizens({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        search
      });
      if (res.success) {
        setCitizens(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load citizens");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchCitizens();
  };

  const openViewProfile = async (citizenId) => {
    try {
      const res = await citizensApi.getCitizenById(citizenId);
      if (res.success) {
        setSelectedCitizen(res.data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      alert("Error loading profile: " + err.message);
    }
  };

  const handleStatusChangeConfirm = async () => {
    setIsActionLoading(true);
    try {
      await citizensApi.updateStatus(statusAction.id, {
        status: statusAction.nextStatus,
        remarks: `Status changed to ${statusAction.nextStatus} by administrator.`
      });
      setIsStatusModalOpen(false);
      fetchCitizens();
    } catch (err) {
      alert("Error updating status: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFlagConfirm = async () => {
    if (!flagReason.trim()) {
      alert("Please provide a reason for flagging this account.");
      return;
    }
    setIsActionLoading(true);
    try {
      await citizensApi.flagCitizen(selectedCitizen.id, {
        is_flagged: !selectedCitizen.is_flagged,
        flag_reason: flagReason,
        admin_remarks: adminRemarks
      });
      setIsFlagModalOpen(false);
      fetchCitizens();
    } catch (err) {
      alert("Error updating flag: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      header: "Citizen ID",
      accessor: "id",
      render: (row) => <span className="font-mono font-bold text-slate-700">#CTZ-{String(row.id).padStart(4, "0")}</span>
    },
    {
      header: "Full Name",
      accessor: "full_name",
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 flex items-center">
            {row.full_name}
            {row.is_flagged && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-rose-100 text-rose-700 font-bold rounded">
                FLAGGED
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">{row.email}</div>
        </div>
      )
    },
    {
      header: "Contact Details",
      accessor: "phone",
      render: (row) => (
        <div className="text-slate-600">
          <div>{row.phone || "No phone registered"}</div>
        </div>
      )
    },
    {
      header: "Registration Date",
      accessor: "created_at",
      render: (row) => (
        <span className="text-slate-500">
          {new Date(row.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          })}
        </span>
      )
    },
    {
      header: "Complaints",
      accessor: "total_complaints",
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
          {row.total_complaints} filed
        </span>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => openViewProfile(row.id)}
            title="View Details"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Eye className="w-4 h-4" />
          </button>

          {row.status === "ACTIVE" ? (
            <button
              onClick={() => {
                setStatusAction({ id: row.id, nextStatus: "INACTIVE" });
                setIsStatusModalOpen(true);
              }}
              title="Deactivate Account"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <XCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                setStatusAction({ id: row.id, nextStatus: "ACTIVE" });
                setIsStatusModalOpen(true);
              }}
              title="Activate Account"
              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              setSelectedCitizen(row);
              setFlagReason(row.flag_reason || "");
              setAdminRemarks(row.admin_remarks || "");
              setIsFlagModalOpen(true);
            }}
            title={row.is_flagged ? "Clear Flag" : "Flag for Review"}
            className={`p-1.5 rounded-lg transition ${
              row.is_flagged
                ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
                : "text-slate-500 hover:text-amber-600 hover:bg-amber-50"
            }`}
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Citizen Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, audit, activate/deactivate, and flag registered citizen accounts.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-700">Total Citizens:</span>
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg">
            {pagination.total}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <form onSubmit={handleSearch} className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by full name, email, or mobile number..."
            onClear={() => {
              setSearch("");
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          />
        </form>

        <FilterDropdown
          label="Account Status"
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          options={[
            { label: "All Statuses", value: "ALL" },
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" },
            { label: "Suspended", value: "SUSPENDED" },
            { label: "Flagged", value: "FLAGGED" }
          ]}
        />
      </div>

      {error && <ErrorState message={error} onRetry={fetchCitizens} />}

      {/* Main Citizens Table */}
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={citizens}
          isLoading={isLoading}
          emptyTitle="No citizens found"
          emptyDescription="No citizen accounts match your current filter criteria."
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        />
      </div>

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleStatusChangeConfirm}
        title={`${statusAction.nextStatus === "ACTIVE" ? "Activate" : "Deactivate"} Citizen Account`}
        message={`Are you sure you want to change this citizen account status to ${statusAction.nextStatus}? Note that accounts with complaint history cannot be deleted, only deactivated.`}
        confirmText={`Set to ${statusAction.nextStatus}`}
        confirmVariant={statusAction.nextStatus === "ACTIVE" ? "success" : "danger"}
        isLoading={isActionLoading}
      />

      {/* Flag / Review Modal */}
      <FormModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        title={selectedCitizen?.is_flagged ? "Clear Flag on Account" : "Flag Citizen Account for Review"}
        subtitle={`Citizen: ${selectedCitizen?.full_name} (${selectedCitizen?.email})`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Flagging / Audit Notice *
            </label>
            <textarea
              rows={3}
              required
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="e.g. Duplicate submissions, spam reportings, or identity verification review requested..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Administrative Remarks (Private)
            </label>
            <input
              type="text"
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              placeholder="Add internal notes for team records..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsFlagModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleFlagConfirm}
              disabled={isActionLoading}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition ${
                selectedCitizen?.is_flagged ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isActionLoading
                ? "Updating..."
                : selectedCitizen?.is_flagged
                ? "Clear Account Flag"
                : "Flag Account for Review"}
            </button>
          </div>
        </div>
      </FormModal>

      {/* View Citizen Profile & Complaint History Modal */}
      <FormModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Citizen Dossier & Grievance Record"
        subtitle={`Profile #CTZ-${String(selectedCitizen?.id).padStart(4, "0")}`}
        maxWidth="max-w-2xl"
      >
        {selectedCitizen && (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Full Name</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedCitizen.full_name}</p>
              </div>

              <div>
                <p className="text-slate-500 font-medium">Account Status</p>
                <div className="mt-1 flex items-center space-x-2">
                  <StatusBadge status={selectedCitizen.status} />
                  {selectedCitizen.is_flagged && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                      FLAGGED
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-slate-500 font-medium">Email Address</p>
                <p className="font-semibold text-slate-800 mt-0.5 flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {selectedCitizen.email}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-medium">Mobile Number</p>
                <p className="font-semibold text-slate-800 mt-0.5 flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {selectedCitizen.phone || "Not recorded"}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-medium">Registered Date</p>
                <p className="font-semibold text-slate-800 mt-0.5 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {new Date(selectedCitizen.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-medium">Administrative Remarks</p>
                <p className="text-slate-700 italic mt-0.5">
                  {selectedCitizen.admin_remarks || "No administrative remarks logged."}
                </p>
              </div>
            </div>

            {/* Complaint History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-1.5 text-blue-600" />
                Citizen Complaint History ({selectedCitizen.complaints?.length || 0})
              </h4>

              {selectedCitizen.complaints?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-xl border border-slate-100">
                  This citizen has not submitted any complaints yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedCitizen.complaints?.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900">{comp.tracking_id}</span>
                          <StatusBadge status={comp.status} />
                        </div>
                        <p className="font-medium text-slate-700 truncate mt-1">{comp.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {comp.category} • {comp.department_name} • Filed on {new Date(comp.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}

export default CitizenManagement;
