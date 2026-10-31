import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { escalationsApi, complaintsApi, officersApi } from "../../services/api";
import DataTable from "../../components/admin/DataTable";
import StatusBadge, { PriorityBadge } from "../../components/admin/StatusBadge";
import { FilterDropdown, ErrorState, LoadingSkeleton } from "../../components/admin/UIControls";
import { FormModal, ConfirmationModal } from "../../components/admin/Modals";
import {
  AlertTriangle,
  Plus,
  UserCheck,
  CheckCircle,
  Clock,
  Shield,
  FileText,
  AlertCircle
} from "lucide-react";

export function EscalationManagement() {
  const [searchParams] = useSearchParams();
  const prefillComplaintId = searchParams.get("complaintId");

  const [escalations, setEscalations] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Escalation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    complaint_id: prefillComplaintId || "",
    reason: "",
    escalation_level: "1",
    assigned_to: "",
    remarks: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolve Modal
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [targetEscalation, setTargetEscalation] = useState(null);
  const [resolutionRemarks, setResolutionRemarks] = useState("");

  // Reassign Modal
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignOfficerId, setReassignOfficerId] = useState("");
  const [reassignRemarks, setReassignRemarks] = useState("");

  useEffect(() => {
    fetchInitial();
  }, [statusFilter]);

  useEffect(() => {
    if (prefillComplaintId) {
      setFormData((prev) => ({ ...prev, complaint_id: prefillComplaintId }));
      setIsCreateModalOpen(true);
    }
  }, [prefillComplaintId]);

  const fetchInitial = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [escRes, offRes, compRes] = await Promise.all([
        escalationsApi.getEscalations({ status: statusFilter }),
        officersApi.getOfficers({ status: "ACTIVE" }),
        complaintsApi.getComplaints({ is_overdue: true })
      ]);

      if (escRes.success) setEscalations(escRes.data);
      if (offRes.success) setOfficers(offRes.data);
      if (compRes.success) setComplaints(compRes.data);
    } catch (err) {
      setError(err.message || "Failed to load escalations.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.complaint_id || !formData.reason.trim()) {
      alert("Complaint ID and escalation reason are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await escalationsApi.create({
        complaint_id: parseInt(formData.complaint_id, 10),
        reason: formData.reason.trim(),
        escalation_level: parseInt(formData.escalation_level, 10),
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to, 10) : null,
        remarks: formData.remarks.trim()
      });

      setIsCreateModalOpen(false);
      setFormData({ complaint_id: "", reason: "", escalation_level: "1", assigned_to: "", remarks: "" });
      fetchInitial();
    } catch (err) {
      alert("Failed to escalate: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!targetEscalation) return;

    setIsSubmitting(true);
    try {
      await escalationsApi.resolve(targetEscalation.id, {
        resolution_remarks: resolutionRemarks.trim()
      });
      setIsResolveModalOpen(false);
      setResolutionRemarks("");
      fetchInitial();
    } catch (err) {
      alert("Resolution update failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!targetEscalation || !reassignOfficerId) {
      alert("Please select an officer to assign this escalation to.");
      return;
    }

    setIsSubmitting(true);
    try {
      await escalationsApi.reassign(targetEscalation.id, {
        assigned_to: parseInt(reassignOfficerId, 10),
        remarks: reassignRemarks.trim()
      });
      setIsReassignModalOpen(false);
      fetchInitial();
    } catch (err) {
      alert("Reassignment failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Level",
      accessor: "escalation_level",
      render: (row) => (
        <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs">
          Lvl {row.escalation_level}
        </span>
      )
    },
    {
      header: "Grievance Ref",
      accessor: "tracking_id",
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-800">{row.tracking_id}</span>
          <p className="text-[11px] text-slate-600 truncate max-w-xs">{row.complaint_title}</p>
        </div>
      )
    },
    {
      header: "Department",
      accessor: "department_name",
      render: (row) => <span className="font-semibold text-slate-800">{row.department_name}</span>
    },
    {
      header: "Assigned Supervisor",
      accessor: "assigned_to_name",
      render: (row) => (
        <div className="text-slate-700">
          <p className="font-medium">{row.assigned_to_name}</p>
          <span className="text-[10px] text-slate-400">By: {row.escalated_by_name}</span>
        </div>
      )
    },
    {
      header: "Escalation Reason",
      accessor: "reason",
      render: (row) => (
        <p className="text-xs text-rose-900 font-medium max-w-xs truncate" title={row.reason}>
          {row.reason}
        </p>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: "Date",
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
          {row.status !== "RESOLVED" && (
            <>
              <button
                onClick={() => {
                  setTargetEscalation(row);
                  setReassignOfficerId("");
                  setReassignRemarks("");
                  setIsReassignModalOpen(true);
                }}
                title="Reassign Supervisor"
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                <UserCheck className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setTargetEscalation(row);
                  setResolutionRemarks("");
                  setIsResolveModalOpen(true);
                }}
                title="Mark Escalation Resolved"
                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            </>
          )}
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
            Escalation & Overdue Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor overdue grievances, handle SLA breaches, escalate unresolved cases, and track supervisory interventions.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4 mr-1.5" />
          Escalate Complaint
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <FilterDropdown
          label="Escalation Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "All Statuses", value: "ALL" },
            { label: "Open", value: "OPEN" },
            { label: "Investigating", value: "INVESTIGATING" },
            { label: "Resolved", value: "RESOLVED" }
          ]}
        />
      </div>

      {error && <ErrorState message={error} onRetry={fetchInitial} />}

      <DataTable
        columns={columns}
        data={escalations}
        isLoading={isLoading}
        emptyTitle="No active escalations"
        emptyDescription="All grievances are progressing normally within their SLA timeline boundaries."
      />

      {/* Create Escalation Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Escalate Unresolved Grievance"
        subtitle="Elevates complaint priority and issues administrative supervisory notice."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Grievance / Complaint *
            </label>
            <select
              required
              value={formData.complaint_id}
              onChange={(e) => setFormData({ ...formData, complaint_id: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            >
              <option value="">-- Choose Grievance --</option>
              {complaints.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tracking_id} - {c.title} ({c.priority})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Escalation Level
              </label>
              <select
                value={formData.escalation_level}
                onChange={(e) => setFormData({ ...formData, escalation_level: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="1">Level 1 - Department Zonal Supervisor</option>
                <option value="2">Level 2 - Chief Executive Engineer</option>
                <option value="3">Level 3 - Municipal Commissioner Office</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assign to Senior Supervisor
              </label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="">-- Keep Current Officer / Auto --</option>
                {officers.map((o) => (
                  <option key={o.user_id} value={o.user_id}>
                    {o.full_name} ({o.department_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Escalation Justification & Breach Reason *
            </label>
            <textarea
              rows={3}
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. Hazardous condition unattended after 48h SLA breach / multiple citizen reports..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
            >
              {isSubmitting ? "Submitting..." : "Issue Escalation Notice"}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Resolve Escalation Modal */}
      <FormModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Mark Escalation Resolved"
        subtitle={`Grievance: ${targetEscalation?.tracking_id}`}
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Resolution Remarks & Action Report *
            </label>
            <textarea
              rows={3}
              required
              value={resolutionRemarks}
              onChange={(e) => setResolutionRemarks(e.target.value)}
              placeholder="Summarize the corrective action taken to remediate this escalation..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsResolveModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
            >
              {isSubmitting ? "Resolving..." : "Mark as Resolved"}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Reassign Officer Modal */}
      <FormModal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        title="Reassign Escalation to Senior Officer"
        subtitle={`Grievance: ${targetEscalation?.tracking_id}`}
      >
        <form onSubmit={handleReassignSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Target Officer *
            </label>
            <select
              required
              value={reassignOfficerId}
              onChange={(e) => setReassignOfficerId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            >
              <option value="">-- Choose Officer --</option>
              {officers.map((o) => (
                <option key={o.user_id} value={o.user_id}>
                  {o.full_name} ({o.department_name} - {o.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reassignment Directive
            </label>
            <textarea
              rows={2}
              value={reassignRemarks}
              onChange={(e) => setReassignRemarks(e.target.value)}
              placeholder="Provide directive to incoming supervisor..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReassignModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
            >
              {isSubmitting ? "Reassigning..." : "Confirm Reassignment"}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}

export default EscalationManagement;
