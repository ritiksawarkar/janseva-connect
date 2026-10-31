import React, { useState, useEffect } from "react";
import { complaintsApi, departmentsApi, officersApi, assignmentsApi } from "../../services/api";
import StatusBadge, { PriorityBadge } from "../../components/admin/StatusBadge";
import { FormModal, ConfirmationModal } from "../../components/admin/Modals";
import { LoadingSkeleton, EmptyState, ErrorState } from "../../components/admin/UIControls";
import {
  UserCheck,
  Building2,
  ShieldCheck,
  Clock,
  MapPin,
  RefreshCw,
  History,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export function ComplaintAssignments() {
  const [activeTab, setActiveTab] = useState("UNASSIGNED"); // UNASSIGNED or ASSIGNED
  const [unassignedComplaints, setUnassignedComplaints] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetComplaint, setTargetComplaint] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [assignmentRemarks, setAssignmentRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [deptRes, offRes, compRes, assignRes] = await Promise.all([
        departmentsApi.getDepartments({ status: "ACTIVE" }),
        officersApi.getOfficers({ status: "ACTIVE" }),
        complaintsApi.getComplaints({ status: "VERIFIED" }),
        assignmentsApi.getAssignments({})
      ]);

      if (deptRes.success) setDepartments(deptRes.data);
      if (offRes.success) setOfficers(offRes.data);
      if (compRes.success) setUnassignedComplaints(compRes.data);
      if (assignRes.success) setAllAssignments(assignRes.data);
    } catch (err) {
      setError(err.message || "Failed to load assignment data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Officers filtered by selected department
  const availableOfficers = officers.filter(
    (o) => o.department_id === parseInt(selectedDeptId, 10) && o.status === "ACTIVE"
  );

  const openAssignModal = (complaint) => {
    setTargetComplaint(complaint);
    setSelectedDeptId(complaint.department_id ? String(complaint.department_id) : "");
    setSelectedOfficerId("");
    setSelectedPriority(complaint.priority || "MEDIUM");
    setAssignmentRemarks("");
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeptId) {
      alert("Please select a responsible department.");
      return;
    }

    setIsSubmitting(true);
    try {
      await assignmentsApi.createAssignment({
        complaint_id: targetComplaint.id,
        department_id: parseInt(selectedDeptId, 10),
        officer_id: selectedOfficerId ? parseInt(selectedOfficerId, 10) : null,
        priority: selectedPriority,
        remarks: assignmentRemarks
      });

      setIsAssignModalOpen(false);
      fetchInitialData();
    } catch (err) {
      alert("Assignment failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openHistory = async (complaintId) => {
    try {
      const res = await assignmentsApi.getForComplaint(complaintId);
      if (res.success) {
        setAssignmentHistory(res.data);
        setIsHistoryModalOpen(true);
      }
    } catch (err) {
      alert("Error fetching assignment history: " + err.message);
    }
  };

  if (isLoading && unassignedComplaints.length === 0 && allAssignments.length === 0) {
    return <LoadingSkeleton rows={6} columns={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Complaint Assignment & Routing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Route verified grievances to authorized departments and active field officers.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-0.5 bg-slate-200/80 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab("UNASSIGNED")}
            className={`px-3.5 py-1.5 rounded-md transition ${
              activeTab === "UNASSIGNED"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Verified Unassigned ({unassignedComplaints.length})
          </button>
          <button
            onClick={() => setActiveTab("ASSIGNED")}
            className={`px-3.5 py-1.5 rounded-md transition ${
              activeTab === "ASSIGNED"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active & Past Assignments ({allAssignments.length})
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchInitialData} />}

      {/* Tab 1: Unassigned Complaints Grid */}
      {activeTab === "UNASSIGNED" && (
        <div className="space-y-4">
          {unassignedComplaints.length === 0 ? (
            <EmptyState
              title="No Unassigned Complaints"
              description="All verified grievances have been assigned to departments."
              icon={CheckCircle}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unassignedComplaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {c.tracking_id}
                      </span>
                      <PriorityBadge priority={c.priority} />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="pt-2 text-xs space-y-1 text-slate-500">
                      <p className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.location}</span>
                      </p>
                      <p className="flex items-center">
                        <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                        <span>Category: {c.category}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Citizen: {c.citizen_name}
                    </span>
                    <button
                      onClick={() => openAssignModal(c)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center"
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Assignments Table */}
      {activeTab === "ASSIGNED" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="min-w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Grievance</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Officer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allAssignments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-800 mr-2">{a.tracking_id}</span>
                    <span className="text-slate-600">{a.complaint_title}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{a.department_name}</td>
                  <td className="py-3 px-4 text-slate-700">
                    {a.officer_name !== "Unknown" ? (
                      <span className="font-medium text-slate-900">{a.officer_name}</span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned officer</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={a.assignment_status} />
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(a.assigned_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openHistory(a.complaint_id)}
                      title="Assignment History"
                      className="px-2.5 py-1 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium"
                    >
                      History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assignment Modal */}
      <FormModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Grievance to Department & Officer"
        subtitle={`Tracking ID: ${targetComplaint?.tracking_id} • Category: ${targetComplaint?.category}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Responsible Department *
            </label>
            <select
              required
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                setSelectedOfficerId("");
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            >
              <option value="">-- Choose Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Assign to Department Officer (Optional)
            </label>
            <select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              disabled={!selectedDeptId || availableOfficers.length === 0}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white disabled:opacity-50"
            >
              <option value="">-- Let department supervisor assign later --</option>
              {availableOfficers.map((o) => (
                <option key={o.user_id} value={o.user_id}>
                  {o.full_name} ({o.designation} - {o.employee_id})
                </option>
              ))}
            </select>
            {selectedDeptId && availableOfficers.length === 0 && (
              <p className="mt-1 text-[11px] text-amber-600">
                No active officers currently registered in this department.
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Confirmed Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="EMERGENCY">EMERGENCY</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Directive & Assignment Remarks
            </label>
            <textarea
              rows={3}
              value={assignmentRemarks}
              onChange={(e) => setAssignmentRemarks(e.target.value)}
              placeholder="e.g. Conduct field inspection by Thursday and file report..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              {isSubmitting ? "Routing..." : "Confirm Department Assignment"}
            </button>
          </div>
        </form>
      </FormModal>

      {/* History Modal */}
      <FormModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Assignment & Reassignment Audit Trail"
        subtitle="Chronological routing log for this grievance"
      >
        <div className="space-y-3 text-xs">
          {assignmentHistory.length === 0 ? (
            <p className="text-slate-400 py-4 text-center">No previous assignment records.</p>
          ) : (
            assignmentHistory.map((h, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{h.department_name}</span>
                  <StatusBadge status={h.assignment_status} />
                </div>
                <p className="text-slate-600">Officer: {h.officer_name}</p>
                <p className="text-slate-500 mt-0.5">Remarks: {h.remarks || "No notes."}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Assigned at: {new Date(h.assigned_at).toLocaleString()} by {h.assigned_by_name}
                </p>
              </div>
            ))
          )}
        </div>
      </FormModal>
    </div>
  );
}

export default ComplaintAssignments;
