import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getComplaintById,
  joinComplaint,
  leaveComplaint
} from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SupporterCount from '../components/SupporterCount';
import ComplaintTimeline from '../components/ComplaintTimeline';
import ImagePreview from '../components/ImagePreview';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  Phone,
  Mail,
  Heart,
  FileCheck,
  CheckCircle2,
  FileText,
  Share2,
  Printer,
  ShieldCheck,
  Check
} from 'lucide-react';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supportLoading, setSupportLoading] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getComplaintById(id);
      if (res.success) {
        setComplaint(res.data);
      }
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError(err.response?.data?.message || 'Complaint not found or inaccessible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, user]);

  const handleToggleSupport = async () => {
    if (!complaint) return;
    setSupportLoading(true);
    try {
      if (complaint.hasJoined) {
        // Leave
        const res = await leaveComplaint(complaint.id);
        if (res.success) {
          showToast('Community support withdrawn.');
          fetchDetails();
        }
      } else {
        // Join
        const res = await joinComplaint(complaint.id);
        if (res.success) {
          showToast(`You have joined ${complaint.trackingId}! Supporter count updated.`);
          fetchDetails();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.', 'error');
    } finally {
      setSupportLoading(false);
      setLeaveModalOpen(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Complaint link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-40 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-md mx-auto py-10">
        <ErrorState message={error || 'Complaint details unavailable.'} onRetry={fetchDetails} />
        <div className="text-center mt-4">
          <Link
            to="/citizen/complaints"
            className="text-xs text-blue-600 hover:underline inline-flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to My Complaints</span>
          </Link>
        </div>
      </div>
    );
  }

  const createdDateStr = new Date(complaint.createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isResolved = complaint.status === 'RESOLVED';
  const isInactive = ['RESOLVED', 'REJECTED'].includes(complaint.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/citizen/complaints"
          className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-2xs"
            title="Share Grievance Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-2xs"
            title="Print Receipt"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Card: Complaint Overview */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
        {/* Badges & Tracking ID */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm sm:text-base font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
              {complaint.trackingId}
            </span>
            <PriorityBadge priority={complaint.priority} />
          </div>

          <div className="flex items-center space-x-2">
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {complaint.title}
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {complaint.description}
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-400 block font-medium">Category</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 block">
              {complaint.category} {complaint.subcategory ? `• ${complaint.subcategory}` : ''}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-400 block font-medium">Submission Timestamp</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 block">
              {createdDateStr}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-400 block font-medium">Location</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 block">
              {complaint.location.locationAddress}
            </span>
          </div>
        </div>

        {/* Community Support Bar */}
        <div className="p-4 bg-gradient-to-r from-blue-50/60 to-emerald-50/60 border border-blue-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <SupporterCount count={complaint.supporterCount} hasJoined={complaint.hasJoined} size="lg" />
            <p className="text-xs text-slate-600">
              {complaint.isOwner
                ? 'You are the registered creator of this grievance.'
                : complaint.hasJoined
                ? 'You are actively supporting this community complaint.'
                : 'Fellow citizens supporting this complaint to prioritize work order.'}
            </p>
          </div>

          {!complaint.isOwner && !isInactive && (
            <button
              type="button"
              onClick={complaint.hasJoined ? () => setLeaveModalOpen(true) : handleToggleSupport}
              disabled={supportLoading}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer ${
                complaint.hasJoined
                  ? 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${complaint.hasJoined ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{complaint.hasJoined ? 'Withdraw Support' : 'Support Grievance'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Department Assignment Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Assigned Responsible Department
          </h3>
        </div>

        {complaint.department ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">
                {complaint.department.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Work order assigned for field inspection and resolution.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {complaint.department.contactEmail && (
                <a
                  href={`mailto:${complaint.department.contactEmail}`}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{complaint.department.contactEmail}</span>
                </a>
              )}
              {complaint.department.contactPhone && (
                <a
                  href={`tel:${complaint.department.contactPhone}`}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{complaint.department.contactPhone}</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 flex items-center space-x-2 py-2">
            <span>Administrative Desk Verification: Department routing suggested as</span>
            <span className="font-semibold text-slate-800">
              {complaint.suggestedDepartment?.name || 'General Administration'}
            </span>
            <span className="text-slate-400">• Final assignment confirmed post-verification</span>
          </div>
        )}
      </div>

      {/* Resolution Details Card (if resolved) */}
      {isResolved && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Resolution & Closure Report</span>
          </div>

          <p className="text-xs md:text-sm text-emerald-950 leading-relaxed bg-white/70 p-4 rounded-xl border border-emerald-100">
            {complaint.resolutionNotes || 'Grievance resolved and verified on-site by municipal officer.'}
          </p>

          {complaint.resolvedAt && (
            <p className="text-[11px] text-emerald-700">
              Closed on: {new Date(complaint.resolvedAt).toLocaleString('en-IN')}
            </p>
          )}
        </div>
      )}

      {/* Evidence Attachments Gallery */}
      {complaint.attachments && complaint.attachments.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Supporting Evidence & Attachments ({complaint.attachments.length})</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {complaint.attachments.map((att) => {
              const isImage = att.mimeType.startsWith('image/');
              return isImage ? (
                <ImagePreview
                  key={att.id}
                  src={`http://localhost:5000${att.url}`}
                  alt={att.fileName}
                  className="h-32"
                />
              ) : (
                <a
                  key={att.id}
                  href={`http://localhost:5000${att.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center hover:bg-slate-100 transition group"
                >
                  <FileText className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition" />
                  <span className="text-[11px] font-medium text-slate-700 mt-2 line-clamp-1">
                    {att.fileName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {(att.fileSize / 1024).toFixed(0)} KB
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Complaint Timeline Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Lifecycle Timeline & Action Audit
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent event history recorded by the grievance resolution system.
          </p>
        </div>

        <ComplaintTimeline
          timeline={complaint.timeline}
          currentStatus={complaint.status}
        />
      </div>

      {/* Confirmation Modal to Leave Support */}
      <ConfirmationModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        onConfirm={handleToggleSupport}
        loading={supportLoading}
        title="Withdraw Community Support"
        message={`Are you sure you want to withdraw your community support from ${complaint.trackingId}?`}
        confirmText="Withdraw Support"
        confirmVariant="rose"
      />
    </div>
  );
};

export default ComplaintDetails;
