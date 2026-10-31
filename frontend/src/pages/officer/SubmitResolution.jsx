import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Camera,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  ArrowLeft,
  UploadCloud,
  ShieldCheck,
  Building2,
  Info
} from "lucide-react";
import { officerApi } from "../../services/api";
import StatusBadge, { PriorityBadge } from "../../components/officer/StatusBadge";
import EvidenceUploader from "../../components/officer/EvidenceUploader";
import ConfirmationModal from "../../components/officer/ConfirmationModal";
import { LoadingSkeleton, ErrorState, ToastNotification } from "../../components/officer/UIFeedback";

export function SubmitResolution() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [resolutionTitle, setResolutionTitle] = useState("");
  const [resolutionDescription, setResolutionDescription] = useState("");
  const [workCompletedDetails, setWorkCompletedDetails] = useState("");
  const [workCompletedAt, setWorkCompletedAt] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );
  const [beforePhotoUrl, setBeforePhotoUrl] = useState("");
  const [afterPhotoUrl, setAfterPhotoUrl] = useState("");
  const [officerRemarks, setOfficerRemarks] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function loadComplaint() {
      setIsLoading(true);
      try {
        const res = await officerApi.getComplaintDetails(id);
        if (res.success && res.data) {
          setComplaint(res.data);
          // Pre-populate before photo from citizen evidence if available
          if (res.data.evidence_urls && res.data.evidence_urls.length > 0) {
            setBeforePhotoUrl(res.data.evidence_urls[0]);
          }
        } else {
          setValidationError(res.message || "Unable to load complaint for resolution.");
        }
      } catch (err) {
        setValidationError(err.message || "Unauthorized access.");
      } finally {
        setIsLoading(false);
      }
    }
    loadComplaint();
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!resolutionTitle.trim()) {
      setValidationError("Please enter a clear resolution summary title.");
      return;
    }

    if (!resolutionDescription.trim()) {
      setValidationError("Resolution description is mandatory. Provide detailed explanation of work performed.");
      return;
    }

    if (!afterPhotoUrl.trim()) {
      setValidationError("Work completion evidence (After photograph) is mandatory before submitting for closure verification.");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmResolution = async () => {
    setIsSubmitting(true);
    setValidationError("");

    try {
      const res = await officerApi.submitResolution(id, {
        resolution_title: resolutionTitle.trim(),
        resolution_description: resolutionDescription.trim(),
        work_completed_details: workCompletedDetails.trim() || undefined,
        work_completed_at: new Date(workCompletedAt).toISOString(),
        before_photo_url: beforePhotoUrl || undefined,
        after_photo_url: afterPhotoUrl,
        officer_remarks: officerRemarks.trim() || undefined
      });

      if (res.success) {
        setToastMessage("Resolution submitted successfully for Admin closure verification!");
        setShowConfirmModal(false);
        setTimeout(() => {
          navigate("/officer/complaints/completed");
        }, 1500);
      } else {
        setValidationError(res.message || "Failed to submit resolution.");
      }
    } catch (err) {
      setValidationError(err.message || "Error submitting resolution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <LoadingSkeleton count={3} height="h-32" />
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
              {complaint?.tracking_id}
            </span>
            <PriorityBadge priority={complaint?.priority} />
            <StatusBadge status={complaint?.status} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Submit Resolution & Completion Evidence
          </h2>
        </div>
      </div>

      {/* Info notice about closure workflow */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold">Government Transparency & Closure Verification Workflow:</p>
          <p className="mt-0.5 text-blue-800">
            Officers cannot silently or directly resolve complaints. Submitting this form updates the complaint status to{" "}
            <strong className="underline">RESOLUTION_SUBMITTED</strong>. The platform Administrator will review your work description and photographic evidence to officially authorize closure.
          </p>
        </div>
      </div>

      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Resolution Summary Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={resolutionTitle}
            onChange={(e) => setResolutionTitle(e.target.value)}
            placeholder="e.g. Complete desilting and clearing of stormwater drain opposite school"
            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            required
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Detailed Work Description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={resolutionDescription}
            onChange={(e) => setResolutionDescription(e.target.value)}
            placeholder="Describe the exact physical work completed, materials applied, quality checks performed, and restoration actions undertaken on site..."
            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            required
          />
        </div>

        {/* Work Completed Equipment / Deployment Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Equipment / Machinery Deployed
            </label>
            <input
              type="text"
              value={workCompletedDetails}
              onChange={(e) => setWorkCompletedDetails(e.target.value)}
              placeholder="e.g. 1 JCB excavator, 2 dump trucks, 6 sanitation staff"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Work Completion Date & Time
            </label>
            <input
              type="datetime-local"
              value={workCompletedAt}
              onChange={(e) => setWorkCompletedAt(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Before & After Photograph Upload Grid */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Resolution Photographic Evidence
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Before Photo */}
            <div>
              <EvidenceUploader
                label="Before Condition Photograph"
                evidenceType="BEFORE"
                value={beforePhotoUrl}
                onChange={setBeforePhotoUrl}
                hint="Shows initial issue condition (auto-loaded from citizen report if present)"
              />
            </div>

            {/* After Photo (Mandatory) */}
            <div>
              <EvidenceUploader
                label="After Completion Photograph"
                required={true}
                evidenceType="AFTER"
                value={afterPhotoUrl}
                onChange={setAfterPhotoUrl}
                hint="MANDATORY: Photograph of site after work has been completed"
              />
            </div>
          </div>
        </div>

        {/* Officer Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Final Officer Remarks / Citizen Consultation Notes (Optional)
          </label>
          <input
            type="text"
            value={officerRemarks}
            onChange={(e) => setOfficerRemarks(e.target.value)}
            placeholder="e.g. Local shopkeeper association verified site restoration. Disinfection sprayed."
            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to={`/officer/complaints/${id}`}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Submit for Closure Verification</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        type="success"
        title="Confirm Resolution Submission"
        message="Are you sure you want to submit this resolution for administrative closure verification? The complaint status will update to RESOLUTION_SUBMITTED with your photographic evidence."
        confirmText="Confirm & Submit Resolution"
        cancelText="Review Form"
        isLoading={isSubmitting}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmResolution}
      />
    </div>
  );
}

export default SubmitResolution;
