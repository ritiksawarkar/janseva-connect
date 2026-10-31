import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BellRing,
  CheckCircle,
  Eye,
  Clock,
  MapPin,
  Building2,
  Calendar,
  AlertCircle,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { officerApi } from "../../services/api";
import StatusBadge, { PriorityBadge } from "../../components/officer/StatusBadge";
import ConfirmationModal from "../../components/officer/ConfirmationModal";
import { LoadingSkeleton, EmptyState, ErrorState, ToastNotification } from "../../components/officer/UIFeedback";

export function NewAssignments() {
  const [newAssignments, setNewAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptanceRemarks, setAcceptanceRemarks] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const navigate = useNavigate();

  const fetchNewAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await officerApi.getNewAssignments();
      if (res.success) {
        setNewAssignments(res.data || []);
      } else {
        setError(res.message || "Failed to fetch new assignments.");
      }
    } catch (err) {
      setError(err.message || "Error communicating with server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewAssignments();
  }, []);

  const handleOpenAcceptModal = (complaint) => {
    setSelectedComplaint(complaint);
    setAcceptanceRemarks("");
  };

  const handleConfirmAccept = async () => {
    if (!selectedComplaint) return;

    setIsAccepting(true);
    try {
      const res = await officerApi.acceptAssignment(selectedComplaint.id, {
        remarks: acceptanceRemarks.trim() || undefined
      });

      if (res.success) {
        setToastMessage(`Assignment for ${selectedComplaint.tracking_id} accepted successfully!`);
        setSelectedComplaint(null);
        // Refresh list
        fetchNewAssignments();
      } else {
        alert(res.message || "Failed to accept assignment.");
      }
    } catch (err) {
      alert(err.message || "Error processing assignment acceptance.");
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <ToastNotification message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Pending Acknowledgment Queue
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            New Assignments ({newAssignments.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and accept newly assigned public complaints to begin field resolution
          </p>
        </div>

        <Link
          to="/officer/complaints"
          className="text-xs text-slate-600 hover:text-blue-600 font-semibold transition"
        >
          ← Back to All Complaints
        </Link>
      </div>

      {error && <ErrorState message={error} onRetry={fetchNewAssignments} />}

      {/* Main List */}
      {isLoading ? (
        <LoadingSkeleton count={3} height="h-44" />
      ) : newAssignments.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No pending new assignments"
          message="All complaints currently assigned to you have been accepted or processed. Check assigned complaints for active work."
          actionText="View Active Complaints"
          onAction={() => navigate("/officer/complaints")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {newAssignments.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-200 transition p-5 space-y-4"
            >
              {/* Top Meta Header */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                    {c.tracking_id}
                  </span>
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-slate-500 font-medium">
                    Category: <strong className="text-slate-700">{c.category}</strong>
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Assigned:{" "}
                    {new Date(c.assigned_at || c.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{c.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.description}</p>
              </div>

              {/* Admin Assignment Remarks */}
              {c.admin_remarks && (
                <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                  <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Admin Assignment Remarks: </span>
                    <span>{c.admin_remarks}</span>
                  </div>
                </div>
              )}

              {/* Location & SLA Bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 truncate max-w-md">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{c.location}</span>
                </div>

                {c.due_at && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Target Resolution Due: {new Date(c.due_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                )}
              </div>

              {/* Actions Button Bar */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Link
                  to={`/officer/complaints/${c.id}`}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect Complaint</span>
                </Link>

                <button
                  onClick={() => handleOpenAcceptModal(c)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accept Assignment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Accepting Assignment */}
      <ConfirmationModal
        isOpen={!!selectedComplaint}
        type="info"
        title={`Accept Assignment: ${selectedComplaint?.tracking_id}`}
        message="By accepting this assignment, the complaint status will move to ACCEPTED, and the citizen will be notified that field inspection is underway. You can also include work scheduling remarks."
        confirmText="Confirm & Accept Assignment"
        cancelText="Cancel"
        isLoading={isAccepting}
        onCancel={() => setSelectedComplaint(null)}
        onConfirm={handleConfirmAccept}
      />
    </div>
  );
}

export default NewAssignments;
