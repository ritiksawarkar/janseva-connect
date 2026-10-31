import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { servicesApi, departmentsApi } from "../../services/api";
import { ArrowLeft, Save, Compass } from "lucide-react";
import { LoadingSkeleton, ErrorState } from "../../components/admin/UIControls";

export function ServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    service_name: "",
    description: "",
    category: "General Administration",
    eligibility: "",
    required_documents: "",
    fees: "Free",
    application_steps: "",
    department_id: "",
    official_application_url: "",
    official_source_url: "",
    verification_status: "VERIFIED",
    publication_status: "PUBLISHED",
    change_summary: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitial();
  }, [id]);

  const fetchInitial = async () => {
    setIsLoading(true);
    try {
      const deptRes = await departmentsApi.getDepartments({ status: "ACTIVE" });
      if (deptRes.success) setDepartments(deptRes.data);

      if (isEditMode) {
        const svcRes = await servicesApi.getServiceById(id);
        if (svcRes.success && svcRes.data) {
          const s = svcRes.data;
          setFormData({
            service_name: s.service_name || "",
            description: s.description || "",
            category: s.category || "General Administration",
            eligibility: s.eligibility || "",
            required_documents: Array.isArray(s.required_documents) ? s.required_documents.join("\n") : "",
            fees: s.fees || "Free",
            application_steps: Array.isArray(s.application_steps) ? s.application_steps.join("\n") : "",
            department_id: s.department_id ? String(s.department_id) : "",
            official_application_url: s.official_application_url || "",
            official_source_url: s.official_source_url || "",
            verification_status: s.verification_status || "VERIFIED",
            publication_status: s.publication_status || "PUBLISHED",
            change_summary: ""
          });
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load service details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.service_name.trim() || !formData.description.trim()) {
      alert("Service name and description are required.");
      return;
    }

    const payload = {
      ...formData,
      department_id: formData.department_id ? parseInt(formData.department_id, 10) : null,
      required_documents: formData.required_documents
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean),
      application_steps: formData.application_steps
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    };

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await servicesApi.update(id, payload);
      } else {
        await servicesApi.create(payload);
      }
      navigate("/admin/services");
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={8} columns={2} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/admin/services")}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditMode ? "Edit Public Service Details" : "Register New Public Service"}
            </h1>
            <p className="text-xs text-slate-500">
              Public services configured here are rendered on the citizen portal and synced with departments.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {isSubmitting ? "Saving..." : isEditMode ? "Save & Create Version" : "Create Service"}
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={fetchInitial} />}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
        {/* Name and Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Public Service Name *
            </label>
            <input
              type="text"
              required
              value={formData.service_name}
              onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
              placeholder="e.g. Municipal Birth Certificate Issuance"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Responsible Department
            </label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
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
        </div>

        {/* Category and Fees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Civic Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            >
              <option value="Health & Vital Statistics">Health & Vital Statistics</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Public Works">Public Works</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Electrical & Power">Electrical & Power</option>
              <option value="General Administration">General Administration</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Applicable Fees / Free Notice
            </label>
            <input
              type="text"
              value={formData.fees}
              onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
              placeholder="e.g. Free or ₹50 within 21 days"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Service Description & Overview *
          </label>
          <textarea
            rows={3}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Comprehensive description of the public service..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
          />
        </div>

        {/* Eligibility Criteria */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Citizen Eligibility Criteria
          </label>
          <textarea
            rows={2}
            value={formData.eligibility}
            onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
            placeholder="Who is eligible to apply for this public civic service..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
          />
        </div>

        {/* Required Documents and Application Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Required Documents (One per line)
            </label>
            <textarea
              rows={4}
              value={formData.required_documents}
              onChange={(e) => setFormData({ ...formData, required_documents: e.target.value })}
              placeholder="Aadhaar Card&#10;Hospital Discharge Certificate&#10;Address Proof"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Application Steps (One per line)
            </label>
            <textarea
              rows={4}
              value={formData.application_steps}
              onChange={(e) => setFormData({ ...formData, application_steps: e.target.value })}
              placeholder="Submit application online&#10;Upload verification documents&#10;Field inspection by engineer"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white"
            />
          </div>
        </div>

        {/* Official URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Official Application Portal URL
            </label>
            <input
              type="url"
              value={formData.official_application_url}
              onChange={(e) => setFormData({ ...formData, official_application_url: e.target.value })}
              placeholder="https://serviceonline.gov.in/..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Official Source Documentation URL
            </label>
            <input
              type="url"
              value={formData.official_source_url}
              onChange={(e) => setFormData({ ...formData, official_source_url: e.target.value })}
              placeholder="https://mumbaicity.gov.in/citizen-services"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>
        </div>

        {/* Status flags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Verification Status
            </label>
            <select
              value={formData.verification_status}
              onChange={(e) => setFormData({ ...formData, verification_status: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            >
              <option value="VERIFIED">VERIFIED (Authenticated)</option>
              <option value="PENDING">PENDING (Draft Review)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Publication Status
            </label>
            <select
              value={formData.publication_status}
              onChange={(e) => setFormData({ ...formData, publication_status: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            >
              <option value="PUBLISHED">PUBLISHED (Visible to Public)</option>
              <option value="DRAFT">DRAFT (Admin Only)</option>
            </select>
          </div>
        </div>

        {/* Version Archive Change Summary (if edit mode) */}
        {isEditMode && (
          <div className="pt-3 border-t border-slate-100">
            <label className="block font-semibold text-slate-700 mb-1">
              Change Summary / Version Notes (Preserved in Historical Archive)
            </label>
            <input
              type="text"
              value={formData.change_summary}
              onChange={(e) => setFormData({ ...formData, change_summary: e.target.value })}
              placeholder="e.g. Updated fee schedule and added online upload step..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>
        )}
      </form>
    </div>
  );
}

export default ServiceForm;
