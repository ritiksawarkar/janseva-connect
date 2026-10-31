import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Camera,
  ArrowLeft,
  Calendar,
  Layers
} from "lucide-react";
import { officerApi } from "../../services/api";
import StatusBadge, { PriorityBadge } from "../../components/officer/StatusBadge";
import EvidenceUploader from "../../components/officer/EvidenceUploader";
import ConfirmationModal from "../../components/officer/ConfirmationModal";
import { LoadingSkeleton, ErrorState, ToastNotification } from "../../components/officer/UIFeedback";

export function UpdateProgress() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [progressDescription, setProgressDescription] = useState("");
  const [workRemarks, setWorkRemarks] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [targetStatus, setTargetStatus] = useState("IN_PROGRESS");
  const [historyItems, setHistoryItems] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [complaintRes, historyRes] = await Promise.all([
        officerApi.getComplaintDetails(id),
        officerApi.getProgressHistory(id)
      ]);

      if (complaintRes.success && complaintRes.data) {
        setComplaint(complaintRes.data);
      } else {
        setError(complaintRes.message || "Failed to load complaint.");
      }

      if (historyRes.success && historyRes.data) {
        setHistoryItems(historyRes.data);
      }
    } catch (err) {
      setError(err.message || "Unauthorized access or invalid complaint.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!progressDescription.trim()) {
      alert("Please provide a description of the work progress.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    setIsSubmitting(true);
    try {
      const res = await officerApi.addProgress(id, {
        progress_description: progressDescription.trim(),
        work_remarks: workRemarks.trim() || undefined,
        new_status: targetStatus,
        progress_photo_url: photoUrl || undefined
      });

      if (res.success) {
        setToastMessage("Progress update saved successfully!");
        setShowConfirmModal(false);
        setTimeout(() => {
          navigate(`/officer/complaints/${id}`);
        }, 1200);
      } else {
        alert(res.message || "Failed to save progress update.");
      }
    } catch (err) {
      alert(err.message || "Error submitting progress update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <LoadingSkeleton count={3} height="h-28" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-md mx-auto py-8">
        <ErrorState message={error || "Complaint not found."} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toastMessage && (
        <ToastNotification message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      {/* Top Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <Link
          to={`/officer/complaints/${id}`}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {complaint.tracking_id}
            </span>
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Update Work Progress: {complaint.title}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: 2 Cols */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5"
          >
            {/* Status Transition Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Status Transition
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-800"
              >
                <option value="IN_PROGRESS">IN_PROGRESS (Work Actively Underway)</option>
                <option value="ACCEPTED">ACCEPTED (Inspection Scheduled / Planning)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Note: Complaints cannot be marked RESOLVED here. Please use "Submit Resolution" once field work is completed.
              </p>
            </div>

            {/* Progress Description (Mandatory) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Progress Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={progressDescription}
                onChange={(e) => setProgressDescription(e.target.value)}
                placeholder="Describe current work completed on site (e.g. Field inspection completed, repair crew dispatched with heavy equipment, trench cleared)..."
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                required
              />
            </div>

            {/* Additional Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Internal Remarks / Material Notes (Optional)
              </label>
              <input
                type="text"
                value={workRemarks}
                onChange={(e) => setWorkRemarks(e.target.value)}
                placeholder="e.g. Awaiting delivery of replacement 40mm valves from zonal store"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Optional Progress Photo */}
            <div>
              <EvidenceUploader
                label="Optional Progress Work Photograph"
                evidenceType="DURING"
                value={photoUrl}
                onChange={setPhotoUrl}
                hint="Attach a photo showing field work in progress if available"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to={`/officer/complaints/${id}`}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save Progress Update</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Previous Progress History */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Previous Progress Log</span>
            </h3>

            {historyItems.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">No previous progress logged.</p>
            ) : (
              <div className="space-y-3">
                {historyItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-blue-600">{item.new_status}</span>
                      <span>
                        {new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 line-clamp-2 leading-relaxed">{item.remarks}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Progress Update"
        message="This progress report will be logged in the public audit trail and the citizen will receive an in-app progress notification. Are you sure you wish to proceed?"
        confirmText="Confirm & Submit Progress"
        cancelText="Review Details"
        isLoading={isSubmitting}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmUpdate}
      />
    </div>
  );
}

export default UpdateProgress;
