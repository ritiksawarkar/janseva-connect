import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { schemesApi, departmentsApi } from "../../services/api";
import { ArrowLeft, Save, SlidersHorizontal, Award } from "lucide-react";
import { LoadingSkeleton, ErrorState } from "../../components/admin/UIControls";

export function SchemeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    scheme_name: "",
    description: "",
    objectives: "",
    benefits: "",
    category: "Housing & Urban Development",
    scheme_level: "CENTRAL",
    state: "All India",
    beneficiary_group: "",
    eligibility_criteria: "",
    min_age: "18",
    max_age: "70",
    max_annual_income: "600000",
    gender: "ANY",
    residence_type: "URBAN",
    required_documents: "",
    application_procedure: "",
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
        const schemeRes = await schemesApi.getSchemeById(id);
        if (schemeRes.success && schemeRes.data) {
          const s = schemeRes.data;
          const elig = s.structured_eligibility || {};
          setFormData({
            scheme_name: s.scheme_name || "",
            description: s.description || "",
            objectives: s.objectives || "",
            benefits: s.benefits || "",
            category: s.category || "Housing & Urban Development",
            scheme_level: s.scheme_level || "CENTRAL",
            state: s.state || "All India",
            beneficiary_group: s.beneficiary_group || "",
            eligibility_criteria: s.eligibility_criteria || "",
            min_age: elig.min_age !== undefined ? String(elig.min_age) : "18",
            max_age: elig.max_age !== undefined ? String(elig.max_age) : "70",
            max_annual_income: elig.max_annual_income !== undefined ? String(elig.max_annual_income) : "600000",
            gender: elig.gender || "ANY",
            residence_type: elig.residence_type || "URBAN",
            required_documents: Array.isArray(s.required_documents) ? s.required_documents.join("\n") : "",
            application_procedure: s.application_procedure || "",
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
      setError(err.message || "Failed to load scheme details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.scheme_name.trim() || !formData.description.trim()) {
      alert("Scheme name and description are required.");
      return;
    }

    const structured_eligibility = {
      min_age: formData.min_age ? parseInt(formData.min_age, 10) : 0,
      max_age: formData.max_age ? parseInt(formData.max_age, 10) : 120,
      max_annual_income: formData.max_annual_income ? parseInt(formData.max_annual_income, 10) : 10000000,
      gender: formData.gender,
      residence_type: formData.residence_type,
      state: formData.state
    };

    const payload = {
      ...formData,
      department_id: formData.department_id ? parseInt(formData.department_id, 10) : null,
      structured_eligibility,
      required_documents: formData.required_documents
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean)
    };

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await schemesApi.update(id, payload);
      } else {
        await schemesApi.create(payload);
      }
      navigate("/admin/schemes");
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
            onClick={() => navigate("/admin/schemes")}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditMode ? "Edit Government Scheme" : "Register Government Welfare Scheme"}
            </h1>
            <p className="text-xs text-slate-500">
              Configure scheme guidelines and structured eligibility rules used by Member 2's eligibility matching engine.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {isSubmitting ? "Saving..." : isEditMode ? "Save & Archive Version" : "Create Scheme"}
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={fetchInitial} />}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
        {/* Name and Level */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Scheme Name *
            </label>
            <input
              type="text"
              required
              value={formData.scheme_name}
              onChange={(e) => setFormData({ ...formData, scheme_name: e.target.value })}
              placeholder="e.g. Pradhan Mantri Awas Yojana (Urban)"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Scheme Level
            </label>
            <select
              value={formData.scheme_level}
              onChange={(e) => setFormData({ ...formData, scheme_level: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            >
              <option value="CENTRAL">CENTRAL (National)</option>
              <option value="STATE">STATE (State-specific)</option>
            </select>
          </div>
        </div>

        {/* State, Category, and Department */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Applicable State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="All India or Maharashtra"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Welfare Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            >
              <option value="Housing & Urban Development">Housing & Urban Development</option>
              <option value="Healthcare & Family Welfare">Healthcare & Family Welfare</option>
              <option value="Social Justice & Empowerment">Social Justice & Empowerment</option>
              <option value="Livelihood & Small Enterprise">Livelihood & Small Enterprise</option>
              <option value="Education & Scholarships">Education & Scholarships</option>
              <option value="Agriculture & Farmers Welfare">Agriculture & Farmers Welfare</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Department
            </label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            >
              <option value="">-- Choose Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Target Beneficiary Group */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Target Beneficiary Group
          </label>
          <input
            type="text"
            value={formData.beneficiary_group}
            onChange={(e) => setFormData({ ...formData, beneficiary_group: e.target.value })}
            placeholder="e.g. Economically Weaker Section (EWS), Low Income Groups (LIG), Destitute Elderly"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
          />
        </div>

        {/* Description, Objectives, and Benefits */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Scheme Description *
          </label>
          <textarea
            rows={2}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Overview of the government scheme..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Core Objectives
            </label>
            <textarea
              rows={2}
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              placeholder="What this initiative aims to accomplish..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Financial or In-Kind Benefits
            </label>
            <textarea
              rows={2}
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              placeholder="e.g. Up to ₹2.67 Lakh loan interest subsidy or ₹1,500/month pension..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>
        </div>

        {/* Structured Eligibility Rules Section */}
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Structured Eligibility Conditions (Eligibility Engine Configuration)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum Age
              </label>
              <input
                type="number"
                value={formData.min_age}
                onChange={(e) => setFormData({ ...formData, min_age: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Maximum Age
              </label>
              <input
                type="number"
                value={formData.max_age}
                onChange={(e) => setFormData({ ...formData, max_age: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Max Annual Income (₹)
              </label>
              <input
                type="number"
                value={formData.max_annual_income}
                onChange={(e) => setFormData({ ...formData, max_annual_income: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Gender Restriction
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <option value="ANY">Any Gender</option>
                <option value="FEMALE">Female Only</option>
                <option value="MALE">Male Only</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Residence Type
              </label>
              <select
                value={formData.residence_type}
                onChange={(e) => setFormData({ ...formData, residence_type: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <option value="ANY">Urban & Rural</option>
                <option value="URBAN">Urban Only</option>
                <option value="RURAL">Rural Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Required Documents and Procedure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Required Documents (One per line)
            </label>
            <textarea
              rows={3}
              value={formData.required_documents}
              onChange={(e) => setFormData({ ...formData, required_documents: e.target.value })}
              placeholder="Aadhaar Card&#10;Income Certificate&#10;Bank Passbook"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Application Procedure
            </label>
            <textarea
              rows={3}
              value={formData.application_procedure}
              onChange={(e) => setFormData({ ...formData, application_procedure: e.target.value })}
              placeholder="Step by step application procedure..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
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
              placeholder="https://pmaymis.gov.in"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Official Guidelines Source URL
            </label>
            <input
              type="url"
              value={formData.official_source_url}
              onChange={(e) => setFormData({ ...formData, official_source_url: e.target.value })}
              placeholder="https://mohua.gov.in"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>
        </div>

        {/* Publication Flags */}
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
              <option value="VERIFIED">VERIFIED</option>
              <option value="PENDING">PENDING</option>
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
              <option value="PUBLISHED">PUBLISHED (Live on Citizen Portal)</option>
              <option value="DRAFT">DRAFT</option>
            </select>
          </div>
        </div>

        {isEditMode && (
          <div className="pt-3 border-t border-slate-100">
            <label className="block font-semibold text-slate-700 mb-1">
              Change Summary / Version Notes (Preserved in Historical Archive)
            </label>
            <input
              type="text"
              value={formData.change_summary}
              onChange={(e) => setFormData({ ...formData, change_summary: e.target.value })}
              placeholder="e.g. Revised income cap from ₹3L to ₹6L as per gazette notification..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>
        )}
      </form>
    </div>
  );
}

export default SchemeForm;
