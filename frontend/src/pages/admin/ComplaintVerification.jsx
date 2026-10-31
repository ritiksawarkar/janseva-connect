import React, { useState, useEffect } from "react";
import { complaintsApi, departmentsApi } from "../../services/api";
import StatusBadge, { PriorityBadge } from "../../components/admin/StatusBadge";
import { ConfirmationModal, FormModal } from "../../components/admin/Modals";
import { LoadingSkeleton, EmptyState, ErrorState } from "../../components/admin/UIControls";
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertTriangle,
  MapPin,
  Users,
  Shield,
  Layers,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react";

export function ComplaintVerification() {
  const [queue, setQueue] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Action Modals
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Form states
  const [verifyRemarks, setVerifyRemarks] = useState("");
  const [verifyDept, setVerifyDept] = useState("");
  const [verifyPriority, setVerifyPriority] = useState("");

  const [rejectReason, setRejectReason] = useState("");
  const [infoExplanation, setInfoExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [queueRes, deptRes] = await Promise.all([
        complaintsApi.getPendingVerification(),
        departmentsApi.getDepartments({})
      ]);

      if (queueRes.success) {
        setQueue(queueRes.data);
        if (queueRes.data.length > 0) {
          setSelectedComplaint(queueRes.data[0]);
        } else {
          setSelectedComplaint(null);
        }
      }
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (err) {
      setError(err.message || "Failed to load verification queue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedComplaint) return;
    setIsSubmitting(true);
    try {
      await complaintsApi.verify(selectedComplaint.id, {
        remarks: verifyRemarks || "Verified genuine by verification desk.",
        recommended_department_id: verifyDept || null,
        priority: verifyPriority || selectedComplaint.priority
      });
      setIsVerifyModalOpen(false);
      setVerifyRemarks("");
      fetchData();
    } catch (err) {
      alert("Verification failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("A valid rejection reason is mandatory.");
      return;
    }
    setIsSubmitting(true);
    try {
      await complaintsApi.reject(selectedComplaint.id, {
        reason: rejectReason.trim()
      });
      setIsRejectModalOpen(false);
      setRejectReason("");
      fetchData();
    } catch (err) {
      alert("Rejection failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!infoExplanation.trim()) {
      alert("Please provide specific details on what information is needed.");
      return;
    }
    setIsSubmitting(true);
    try {
      await complaintsApi.requestInformation(selectedComplaint.id, {
        explanation: infoExplanation.trim()
      });
      setIsInfoModalOpen(false);
      setInfoExplanation("");
      fetchData();
    } catch (err) {
      alert("Request failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && queue.length === 0) {
    return <LoadingSkeleton rows={8} columns={3} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Complaint Verification Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit submitted complaints, check for duplicate submissions, verify civic legitimacy, and approve for assignment.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-700">Pending Review:</span>
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg">
            {queue.length} Cases
          </span>
        </div>
      </div>

      {queue.length === 0 ? (
        <EmptyState
          title="Verification Queue Clear"
          description="Great job! There are currently no newly submitted complaints awaiting administrative verification."
          icon={CheckCircle}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Queue List */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 h-[750px] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Incoming Complaints ({queue.length})
              </span>
              <span className="text-[11px] text-slate-400">Select to inspect</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {queue.map((c) => {
                const isSelected = selectedComplaint?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedComplaint(c);
                      setVerifyDept("");
                      setVerifyPriority(c.priority);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-400 shadow-xs ring-1 ring-blue-300"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {c.tracking_id}
                      </span>
                      <PriorityBadge priority={c.priority} />
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 truncate">
                      {c.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 flex items-center mt-1 truncate">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                      {c.location}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{c.citizen?.full_name}</span>
                      {c.duplicate_warning && (
                        <span className="inline-flex items-center text-amber-600 font-bold text-[10px] bg-amber-50 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Similar reports
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Review & Decision Actions */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs h-[750px] overflow-y-auto flex flex-col justify-between">
            {selectedComplaint ? (
              <div className="space-y-5">
                {/* Header ribbon */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {selectedComplaint.tracking_id}
                      </span>
                      <PriorityBadge priority={selectedComplaint.priority} />
                      <StatusBadge status={selectedComplaint.status} />
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-2">
                      {selectedComplaint.title}
                    </h2>
                  </div>
                </div>

                {/* Duplicate / Similar Warning Notice */}
                {selectedComplaint.duplicate_warning && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Duplicate / Similar Grievances Detected Nearby</p>
                      <p className="mt-0.5 text-amber-700">
                        Our spatial & category index flagged other active reports in this locality. Review carefully before approving.
                      </p>
                    </div>
                  </div>
                )}

                {/* Complaint Body */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Grievance Description
                  </h4>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Evidence Artifacts */}
                {selectedComplaint.evidence_urls && selectedComplaint.evidence_urls.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Evidence Uploads
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {selectedComplaint.evidence_urls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-36 h-24 rounded-lg overflow-hidden border border-slate-200 group relative shrink-0"
                        >
                          <img src={url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-medium">Category:</span>
                    <p className="font-semibold text-slate-800">{selectedComplaint.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Location:</span>
                    <p className="font-semibold text-slate-800">{selectedComplaint.location}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Reporting Citizen:</span>
                    <p className="font-semibold text-slate-800">
                      {selectedComplaint.citizen?.full_name}{" "}
                      {selectedComplaint.citizen?.is_flagged && (
                        <span className="text-[10px] text-rose-600 font-bold">(Flagged)</span>
                      )}
                    </p>
                    <p className="text-slate-500 text-[11px]">{selectedComplaint.citizen?.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Community Backing:</span>
                    <p className="font-semibold text-slate-800">
                      {selectedComplaint.supporters_count} Supporters
                    </p>
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    onClick={() => setIsInfoModalOpen(true)}
                    className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition flex items-center"
                  >
                    <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Request More Info
                  </button>

                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="px-3.5 py-2 border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-semibold transition flex items-center"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject Complaint
                  </button>

                  <button
                    onClick={() => setIsVerifyModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Verify & Approve
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-20">Select a complaint from the queue.</p>
            )}
          </div>
        </div>
      )}

      {/* Verify Confirmation Modal */}
      <FormModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Verify Complaint Authenticity"
        subtitle={`Tracking ID: ${selectedComplaint?.tracking_id}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Recommended Responsible Department (Optional)
            </label>
            <select
              value={verifyDept}
              onChange={(e) => setVerifyDept(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            >
              <option value="">-- Let assignment officer decide later --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Priority Adjustment (Optional)
            </label>
            <select
              value={verifyPriority}
              onChange={(e) => setVerifyPriority(e.target.value)}
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
              Verification Remarks / Inspection Notes
            </label>
            <textarea
              rows={3}
              value={verifyRemarks}
              onChange={(e) => setVerifyRemarks(e.target.value)}
              placeholder="e.g. Complaint verified authentic via photo evidence and cross-referenced with municipal records..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsVerifyModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
            >
              {isSubmitting ? "Verifying..." : "Confirm Verification"}
            </button>
          </div>
        </div>
      </FormModal>

      {/* Reject Reason Modal */}
      <FormModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Grievance"
        subtitle={`Tracking ID: ${selectedComplaint?.tracking_id}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            A clear and transparent reason is mandatory. This explanation will be delivered directly to the citizen's portal.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reason for Rejection *
            </label>
            <textarea
              rows={4}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. The described issue lies on private property outside municipal jurisdiction / insufficient address details / duplicate of GRV-2026-..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isSubmitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
            >
              {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </div>
      </FormModal>

      {/* Request Information Modal */}
      <FormModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Request Additional Information from Citizen"
        subtitle={`Tracking ID: ${selectedComplaint?.tracking_id}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            The status will be updated to <span className="font-semibold text-orange-600">NEEDS_INFORMATION</span> and the citizen will be notified to clarify the requested points.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Required Clarification Explanation *
            </label>
            <textarea
              rows={4}
              required
              value={infoExplanation}
              onChange={(e) => setInfoExplanation(e.target.value)}
              placeholder="e.g. Please provide exact landmark or pole number, or upload an image showing the water leakage source..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsInfoModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleRequestInfo}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              {isSubmitting ? "Sending..." : "Send Request to Citizen"}
            </button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}

export default ComplaintVerification;
