import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RotateCcw,
  AlertCircle,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { eligibilityApi } from "../api";
import PageHeader from "../components/PageHeader";

const INITIAL_FORM = {
  age: "",
  state: "Maharashtra",
  district: "",
  annualIncome: "",
  education: "",
  occupation: "",
  gender: "",
  category: "",
};

export function EligibilityChecker() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const errs = {};
    const ageNum = parseInt(formData.age, 10);
    if (!formData.age || isNaN(ageNum)) {
      errs.age = "Please enter your age in years.";
    } else if (ageNum < 1 || ageNum > 120) {
      errs.age = "Please provide an age between 1 and 120.";
    }

    if (!formData.state || formData.state.trim().length < 2) {
      errs.state = "Please select or enter your state of residence.";
    }

    const incomeNum = parseFloat(formData.annualIncome);
    if (formData.annualIncome === "" || isNaN(incomeNum)) {
      errs.annualIncome = "Please enter your annual family income (enter 0 if none).";
    } else if (incomeNum < 0) {
      errs.annualIncome = "Annual income cannot be negative.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        age: parseInt(formData.age, 10),
        state: formData.state.trim(),
        district: formData.district.trim(),
        annualIncome: parseFloat(formData.annualIncome),
        education: formData.education,
        occupation: formData.occupation,
        gender: formData.gender,
        category: formData.category,
      };

      const response = await eligibilityApi.check(payload);

      if (response.data?.success) {
        // Store results in sessionStorage for reload persistence
        sessionStorage.setItem("lastEligibilityResult", JSON.stringify(response.data));
        sessionStorage.setItem("lastEligibilityInput", JSON.stringify(payload));
        navigate("/eligibility-results", {
          state: {
            resultData: response.data,
            inputData: payload,
          },
        });
      } else {
        setServerError(response.data?.message || "Failed to process eligibility.");
      }
    } catch (err) {
      console.error("Eligibility check error:", err);
      setServerError(
        err.response?.data?.message ||
          "Could not connect to the eligibility evaluation service. Please check your backend connection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title={t("checker.title")}
        subtitle={t("checker.subtitle")}
        breadcrumbs={[{ label: t("nav.checker") }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* PRIVACY NOTICE CARD */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-8 flex items-start gap-3.5 shadow-xs">
          <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-emerald-900">
            <p className="font-bold text-emerald-950 text-sm">
              {t("checker.privacyBadge")}
            </p>
            <p className="leading-relaxed">
              JanSeva Connect adheres to strict data minimization. We only collect the minimal demographic fields required to match official scheme rules. We will never ask for your Aadhaar card number, bank credentials, passwords, or phone OTPs. Form responses are processed in memory and not permanently stored.
            </p>
          </div>
        </div>

        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* ELIGIBILITY FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8"
        >
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Citizen Profile Information
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Provide accurate information to receive the most relevant scheme matches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Age */}
            <div>
              <label
                htmlFor="age"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                {t("checker.ageLabel")} <span className="text-rose-600">*</span>
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min="0"
                max="120"
                value={formData.age}
                onChange={handleChange}
                placeholder={t("checker.agePlaceholder")}
                className={`w-full py-2.5 px-3.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errors.age ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                }`}
              />
              {errors.age && (
                <p className="text-xs text-rose-600 font-medium mt-1">{errors.age}</p>
              )}
            </div>

            {/* Annual Income */}
            <div>
              <label
                htmlFor="annualIncome"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                {t("checker.incomeLabel")} <span className="text-rose-600">*</span>
              </label>
              <input
                id="annualIncome"
                name="annualIncome"
                type="number"
                min="0"
                step="1000"
                value={formData.annualIncome}
                onChange={handleChange}
                placeholder={t("checker.incomePlaceholder")}
                className={`w-full py-2.5 px-3.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errors.annualIncome ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                }`}
              />
              {errors.annualIncome && (
                <p className="text-xs text-rose-600 font-medium mt-1">
                  {errors.annualIncome}
                </p>
              )}
            </div>

            {/* State */}
            <div>
              <label
                htmlFor="state"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                {t("checker.stateLabel")} <span className="text-rose-600">*</span>
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Delhi">Delhi</option>
                <option value="Other State">Other State / All India</option>
              </select>
            </div>

            {/* District */}
            <div>
              <label
                htmlFor="district"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                {t("checker.districtLabel")}
              </label>
              <input
                id="district"
                name="district"
                type="text"
                value={formData.district}
                onChange={handleChange}
                placeholder={t("checker.districtPlaceholder")}
                className="w-full py-2.5 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Occupation */}
            <div>
              <label
                htmlFor="occupation"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                {t("checker.occupationLabel")}
              </label>
              <select
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Occupation...</option>
                <option value="Student">Student</option>
                <option value="Farmer">Farmer / Agriculturalist</option>
                <option value="Job Seeker">Job Seeker / Unemployed</option>
                <option value="Salaried Employee">Salaried / Private Sector</option>
                <option value="Self-Employed">Self-Employed / Small Business</option>
                <option value="Homemaker">Homemaker / Housewife</option>
                <option value="Senior Citizen / Retired">Senior Citizen / Retired</option>
              </select>
            </div>

            {/* Education */}
            <div>
              <label
                htmlFor="education"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                {t("checker.educationLabel")}
              </label>
              <select
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Education Level...</option>
                <option value="Below 10th">Below 10th Standard</option>
                <option value="10th Pass">10th Standard (SSC)</option>
                <option value="Higher Secondary">12th Standard (HSC)</option>
                <option value="Diploma">Diploma / ITI</option>
                <option value="Undergraduate">Undergraduate Degree (BA, BCom, BSc, BE)</option>
                <option value="Postgraduate">Postgraduate Degree (MA, MCom, MSc, ME)</option>
                <option value="PhD">Doctorate / PhD</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                {t("checker.genderLabel")}
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Prefer not to say / Any</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Used only for women-specific welfare schemes like Ladki Bahin or PMMVY.
              </p>
            </div>

            {/* Category / Caste */}
            <div>
              <label
                htmlFor="category"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Social Category (Optional)
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Category (If applicable)...</option>
                <option value="General">General / Open (EBC)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="OBC">Other Backward Class (OBC)</option>
                <option value="VJNT">VJ / NT / SBC</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Used to evaluate social justice scholarships and fee waivers.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t("checker.resetBtn")}</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm shadow-xs transition-colors inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t("checker.evaluating")}</span>
                </>
              ) : (
                <>
                  <span>{t("checker.checkBtn")}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center leading-relaxed">
            {t("checker.disclaimer")}
          </p>
        </form>
      </div>
    </div>
  );
}

export default EligibilityChecker;
