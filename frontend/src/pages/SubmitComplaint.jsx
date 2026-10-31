import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getCategories,
  submitComplaint,
  findNearbyComplaints,
  joinComplaint
} from '../services/complaintService';
import LocationPicker from '../components/LocationPicker';
import AttachmentUploader from '../components/AttachmentUploader';
import NearbyComplaintCard from '../components/NearbyComplaintCard';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  MapPin,
  Upload,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  ShieldCheck,
  Building2,
  Search
} from 'lucide-react';

export const SubmitComplaint = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    priority: 'MEDIUM',
    preferred_contact_method: 'IN_APP',
    is_emergency: false,
    is_public: true
  });

  const [location, setLocation] = useState({
    state: 'Maharashtra',
    district: 'Pune',
    area: '',
    landmark: '',
    location_address: '',
    latitude: '',
    longitude: ''
  });

  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  // Nearby Discovery Check State
  const [nearbySuggestions, setNearbySuggestions] = useState([]);
  const [checkingNearby, setCheckingNearby] = useState(false);
  const [nearbyChecked, setNearbyChecked] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        if (res.success) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              category: res.data[0].name,
              subcategory: res.data[0].subcategories[0] || ''
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, []);

  // Update subcategories when category changes
  const currentCategoryObj = categories.find((c) => c.name === formData.category);
  const availableSubcategories = currentCategoryObj?.subcategories || [];

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    const catObj = categories.find((c) => c.name === newCat);
    setFormData((prev) => ({
      ...prev,
      category: newCat,
      subcategory: catObj?.subcategories[0] || ''
    }));
  };

  // Nearby check function
  const checkNearby = async () => {
    if (!location.latitude || !location.longitude) {
      showToast('Please capture or enter GPS coordinates to check for nearby complaints.', 'error');
      return;
    }

    try {
      setCheckingNearby(true);
      const res = await findNearbyComplaints({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 2,
        category: formData.category,
        keywords: formData.title,
        limit: 3
      });

      if (res.success) {
        setNearbySuggestions(res.data);
        setNearbyChecked(true);
        if (res.data.length > 0) {
          showToast(`Found ${res.data.length} similar active complaints nearby.`, 'info');
        } else {
          showToast('No duplicate complaints found nearby. You can submit your grievance.', 'success');
        }
      }
    } catch (err) {
      console.error('Nearby search error:', err);
    } finally {
      setCheckingNearby(false);
    }
  };

  const handleJoinExisting = async (comp) => {
    try {
      setJoiningId(comp.id);
      const res = await joinComplaint(comp.id);
      if (res.success) {
        showToast(`You have joined ${comp.trackingId}! Supporter count updated.`);
        navigate(`/citizen/complaints/${comp.id}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to join existing complaint.', 'error');
    } finally {
      setJoiningId(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim() || formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }
    if (!formData.description.trim() || formData.description.trim().length < 15) {
      newErrors.description = 'Please provide a clear description (at least 15 characters).';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a complaint category.';
    }
    if (!location.district.trim()) {
      newErrors.district = 'District is required.';
    }
    if (!location.area.trim()) {
      newErrors.area = 'Area / Ward name is required.';
    }
    if (!location.location_address.trim()) {
      newErrors.location_address = 'Full street or site address is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // If coordinates are present but nearby hasn't been checked yet, run nearby check first
      if (location.latitude && location.longitude && !nearbyChecked) {
        checkNearby();
      }
      setConfirmModalOpen(true);
    } else {
      showToast('Please fix the highlighted errors before submitting.', 'error');
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      if (formData.subcategory) data.append('subcategory', formData.subcategory);
      data.append('priority', formData.priority);
      data.append('preferred_contact_method', formData.preferred_contact_method);
      data.append('is_emergency', formData.is_emergency);
      data.append('is_public', formData.is_public);

      data.append('state', location.state || 'Maharashtra');
      data.append('district', location.district);
      data.append('area', location.area);
      if (location.landmark) data.append('landmark', location.landmark);
      data.append('location_address', location.location_address);
      if (location.latitude) data.append('latitude', location.latitude);
      if (location.longitude) data.append('longitude', location.longitude);

      for (const file of files) {
        data.append('attachments', file);
      }

      const res = await submitComplaint(data);
      if (res.success) {
        setSubmissionSuccess(res.data);
        showToast('Complaint registered successfully!');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit complaint.', 'error');
    } finally {
      setSubmitting(false);
      setConfirmModalOpen(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="max-w-xl mx-auto py-8 text-center animate-in zoom-in-95 duration-200">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Registration Successful
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Complaint Registered
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Your grievance has been safely logged in the central grievance registry.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Tracking ID:</span>
              <span className="text-sm font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                {submissionSuccess.trackingId}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Current Status:</span>
              <span className="text-xs font-semibold text-slate-700">
                SUBMITTED (Pending Verification)
              </span>
            </div>

            {submissionSuccess.suggestedDepartment && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-xs text-slate-500 font-medium">Suggested Department:</span>
                <span className="text-xs font-semibold text-slate-900 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{submissionSuccess.suggestedDepartment}</span>
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Note: Submission does not imply official verification. The administrative desk will verify and dispatch work order.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/citizen/complaints/${submissionSuccess.complaintId}`}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
            >
              View Complaint Details & Timeline
            </Link>
            <Link
              to="/citizen/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-xl transition"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Register Public Grievance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Submit your civic complaint with photo evidence and location for official department resolution.
        </p>
      </div>

      <form onSubmit={handlePreSubmit} className="space-y-6">
        {/* Section A: Complaint Information */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaint Information</h3>
              <p className="text-[11px] text-slate-400">Describe the issue clearly</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Complaint Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Garbage accumulation near community park"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full text-xs md:text-sm bg-white border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
                errors.title ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subcategory
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Provide exact details regarding duration of the issue, severity, and impact on local residents..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full text-xs md:text-sm bg-white border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
                errors.description ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none"
              >
                <option value="LOW">Low - Routine issue</option>
                <option value="MEDIUM">Medium - Normal civic issue</option>
                <option value="HIGH">High - Significant disruption</option>
                <option value="EMERGENCY">Emergency - Severe safety hazard / pipe burst</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isEmergency"
                checked={formData.is_emergency}
                onChange={(e) => setFormData({ ...formData, is_emergency: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 border-slate-300"
              />
              <label htmlFor="isEmergency" className="text-xs font-medium text-slate-700 cursor-pointer">
                Mark as Public Emergency (Urgent Response)
              </label>
            </div>
          </div>
        </div>

        {/* Section B: Location Information */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                B
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Location Information</h3>
                <p className="text-[11px] text-slate-400">Pinpoint grievance location</p>
              </div>
            </div>

            {location.latitude && location.longitude && (
              <button
                type="button"
                onClick={checkNearby}
                disabled={checkingNearby}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{checkingNearby ? 'Checking...' : 'Check Similar Nearby'}</span>
              </button>
            )}
          </div>

          <LocationPicker location={location} onChange={setLocation} errors={errors} />
        </div>

        {/* Section E: Nearby Complaint Discovery Notice */}
        {nearbySuggestions.length > 0 && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Similar Active Grievances Found Nearby!
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed mt-0.5">
                  Citizens near your area have already reported related issues. You can support an existing complaint with 1 click to escalate priority, or continue creating your own.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {nearbySuggestions.map((comp) => (
                <NearbyComplaintCard
                  key={comp.id}
                  complaint={comp}
                  onJoin={handleJoinExisting}
                  joiningId={joiningId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section C: Evidence Upload */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
              C
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Evidence Upload</h3>
              <p className="text-[11px] text-slate-400">Attach photographs or site documents</p>
            </div>
          </div>

          <AttachmentUploader files={files} onChange={setFiles} />
        </div>

        {/* Section D: Contact Preferences */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
              D
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Contact & Privacy Preferences</h3>
              <p className="text-[11px] text-slate-400">Choose how you receive status updates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'IN_APP', label: 'In-App Notifications', desc: 'Alerts in citizen dashboard' },
              { id: 'EMAIL', label: 'Email Notifications', desc: 'Status updates sent to email' },
              { id: 'SMS', label: 'SMS Alerts', desc: 'Direct mobile message updates' }
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  formData.preferred_contact_method === opt.id
                    ? 'bg-blue-50/60 border-blue-600 text-blue-900'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="contact_pref"
                    value={opt.id}
                    checked={formData.preferred_contact_method === opt.id}
                    onChange={() => setFormData({ ...formData, preferred_contact_method: opt.id })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold">{opt.label}</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 pl-5">{opt.desc}</span>
              </label>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Privacy Notice: Your personal phone number and exact residence address remain strictly confidential.</span>
          </div>
        </div>

        {/* Section F: Submit Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link
            to="/citizen/dashboard"
            className="px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-2"
          >
            <span>Proceed to Submit Grievance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleFinalSubmit}
        loading={submitting}
        title="Confirm Grievance Submission"
        message="Are you sure you want to register this complaint? It will be assigned a unique tracking ID and queued for departmental verification."
        confirmText="Confirm & Submit"
        confirmVariant="blue"
      />
    </div>
  );
};

export default SubmitComplaint;
