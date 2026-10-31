import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  Building2,
  FileText,
  Camera,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  ArrowLeft
} from "lucide-react";
import { officerApi } from "../../services/api";
import StatusBadge, { PriorityBadge } from "../../components/officer/StatusBadge";
import ComplaintTimeline from "../../components/officer/ComplaintTimeline";
import ConfirmationModal from "../../components/officer/ConfirmationModal";
import { LoadingSkeleton, ErrorState, ToastNotification } from "../../components/officer/UIFeedback";

export function OfficerComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await officerApi.getComplaintDetails(id);
      if (res.success && res.data) {
        setComplaint(res.data);
      } else {
        setError(res.message || "Failed to load complaint details.");
      }
    } catch (err) {
      setError(err.message || "Unauthorized or invalid complaint ID.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const res = await officerApi.acceptAssignment(complaint.id, {
        remarks: "Accepted directly from complaint inspection panel."
      });
      if (res.success) {
        setToastMessage("Assignment accepted successfully!");
        setShowAcceptModal(false);
        fetchDetails();
      } else {
        alert(res.message || "Failed to accept assignment.");
      }
    } catch (err) {
      alert(err.message || "Error processing acceptance.");
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <LoadingSkeleton count={4} height="h-32" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <ErrorState message={error || "Complaint details unavailable."} onRetry={fetchDetails} />
        <div className="mt-4 text-center">
          <Link to="/officer/complaints" className="text-xs text-blue-600 font-semibold hover:underline">
            ← Return to Assigned Complaints
          </Link>
        </div>
      </div>
    );
  }

  const isBreached = complaint.sla?.is_overdue;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toastMessage && (
        <ToastNotification message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link
            to="/officer/complaints"
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
            <h2 className="text-base lg:text-lg font-bold text-slate-900 mt-1">
              {complaint.title}
            </h2>
          </div>
        </div>

        {/* Dynamic Action Buttons based on Complaint Lifecycle */}
        <div className="flex items-center gap-2 flex-wrap">
          {complaint.status === "ASSIGNED" && (
            <button
              onClick={() => setShowAcceptModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Accept Assignment</span>
            </button>
          )}

          {(complaint.status === "ACCEPTED" || complaint.status === "IN_PROGRESS") && (
            <>
              <Link
                to={`/officer/complaints/${complaint.id}/progress`}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Update Progress</span>
              </Link>

              <Link
                to={`/officer/complaints/${complaint.id}/resolution`}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Submit Resolution</span>
              </Link>
            </>
          )}

          {complaint.status === "RESOLUTION_SUBMITTED" && (
            <div className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold rounded-xl flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              <span>Resolution Awaiting Admin Sign-off</span>
            </div>
          )}

          {complaint.status === "RESOLVED" && (
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Complaint Resolved & Closed</span>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Description */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Complaint Description & Scope
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
              {complaint.description}
            </p>

            {complaint.verification_remarks && (
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 mt-3">
                <span className="font-bold">Admin Verification Notes: </span>
                <span>{complaint.verification_remarks}</span>
              </div>
            )}
          </div>

          {/* Citizen-Submitted Evidence */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-slate-500" />
              <span>Citizen-Uploaded Evidence (Before Condition)</span>
            </h3>

            {(!complaint.evidence_urls || complaint.evidence_urls.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No photographs submitted by citizen.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {complaint.evidence_urls.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl border border-slate-200 overflow-hidden group">
                    <img
                      src={url}
                      alt={`Citizen Evidence ${idx + 1}`}
                      className="w-full h-44 object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800";
                      }}
                    />
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1"
                    >
                      <span>View Full Resolution</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submitted Resolution Details if any */}
          {complaint.resolution && (
            <div className="bg-white rounded-2xl border border-purple-200 p-5 shadow-xs space-y-4 bg-purple-50/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>Officer Submitted Resolution Details</span>
                </h3>
                <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  Status: {complaint.resolution.status}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900">{complaint.resolution.resolution_title}</h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {complaint.resolution.resolution_description}
                </p>
                {complaint.resolution.officer_remarks && (
                  <p className="text-xs text-slate-500 italic mt-2">
                    Remarks: {complaint.resolution.officer_remarks}
                  </p>
                )}
              </div>

              {/* Resolution Evidence Photos */}
              {complaint.resolution.evidence && complaint.resolution.evidence.length > 0 && (
                <div className="pt-3 border-t border-purple-100">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Resolution Evidence Photos:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {complaint.resolution.evidence.map((ev) => (
                      <div key={ev.id} className="relative rounded-xl border border-slate-200 overflow-hidden group">
                        <img
                          src={ev.storage_key}
                          alt={ev.file_name}
                          className="w-full h-36 object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800";
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {ev.evidence_type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chronological Complaint Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Complete Complaint Audit History</span>
            </h3>

            <ComplaintTimeline items={complaint.timeline || []} />
          </div>
        </div>

        {/* Right 1 Col: Location, Citizen & SLA Metadata */}
        <div className="space-y-6">
          {/* Location Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Location Details</span>
            </h3>

            <p className="text-xs font-semibold text-slate-800 leading-snug">
              {complaint.location}
            </p>

            {complaint.latitude && complaint.longitude ? (
              <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                <p>Coordinates: {complaint.latitude}, {complaint.longitude}</p>
                <a
                  href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                >
                  <span>Open Location in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(complaint.location)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
              >
                <span>Search Location on Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Citizen Contact Information (Sanitized for Field Operations) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-600" />
              <span>Citizen Contact Information</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-800">
                  {complaint.citizen?.full_name || "Civic Citizen"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <a
                  href={`tel:${complaint.citizen?.phone}`}
                  className="text-slate-600 hover:text-blue-600 font-mono"
                >
                  {complaint.citizen?.phone || "Not provided"}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-600 font-mono text-[11px] truncate">
                  {complaint.citizen?.email || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {/* SLA & Deadlines */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>SLA Resolution Timeline</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">SLA Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    isBreached ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {isBreached ? "BREACHED" : "ON SCHEDULE"}
                </span>
              </div>

              {complaint.sla?.due_at && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Due:</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(complaint.sla.due_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              )}

              {complaint.sla && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Remaining:</span>
                  <span
                    className={`font-bold ${isBreached ? "text-red-600" : "text-blue-600"}`}
                  >
                    {isBreached
                      ? `${Math.abs(complaint.sla.remaining_hours)}h overdue`
                      : `${complaint.sla.remaining_hours}h left`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Accept */}
      <ConfirmationModal
        isOpen={showAcceptModal}
        title={`Accept Assignment: ${complaint.tracking_id}`}
        message="Are you sure you want to accept this assignment? This will acknowledge receipt and move the status to ACCEPTED."
        confirmText="Yes, Accept Assignment"
        cancelText="Cancel"
        isLoading={isAccepting}
        onCancel={() => setShowAcceptModal(false)}
        onConfirm={handleAccept}
      />
    </div>
  );
}

export default OfficerComplaintDetails;
