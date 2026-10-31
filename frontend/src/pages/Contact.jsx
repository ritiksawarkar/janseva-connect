import { useState } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { contactApi } from "../api";
import PageHeader from "../components/PageHeader";

const INITIAL_FORM = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function Contact() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = "Please enter your full name (at least 2 characters).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      errs.subject = "Please enter a subject (at least 3 characters).";
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = "Please write a message with at least 10 characters.";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await contactApi.submit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      if (response.data?.success) {
        setSuccessData(response.data);
        setFormData(INITIAL_FORM);
      } else {
        setServerError(response.data?.message || "Failed to submit message.");
      }
    } catch (err) {
      console.error("Contact submission error:", err);
      setServerError(
        err.response?.data?.message ||
          "Unable to send message to platform support. Please verify backend is running."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
        breadcrumbs={[{ label: t("nav.contact") }]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs">
              {successData ? (
                <div className="p-8 text-center space-y-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-950">
                    {t("contact.successTitle")}
                  </h3>
                  <p className="text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
                    {t("contact.successDesc")}
                  </p>
                  {successData.ticketId && (
                    <p className="text-xs font-semibold text-emerald-700">
                      Inquiry Reference ID: #{successData.ticketId}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setSuccessData(null)}
                    className="mt-4 px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Send a Message to Support
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Report an issue, propose a new scheme listing, or suggest improvements.
                    </p>
                  </div>

                  {serverError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                      >
                        {t("contact.fullName")} <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t("contact.fullNamePlaceholder")}
                        className={`w-full py-2.5 px-3.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                          errors.name ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                        }`}
                      />
                      {errors.name && (
                        <p className="text-xs text-rose-600 font-medium mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                      >
                        {t("contact.email")} <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t("contact.emailPlaceholder")}
                        className={`w-full py-2.5 px-3.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                          errors.email ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-xs text-rose-600 font-medium mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      {t("contact.subject")} <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={t("contact.subjectPlaceholder")}
                      className={`w-full py-2.5 px-3.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errors.subject ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                      }`}
                    />
                    {errors.subject && (
                      <p className="text-xs text-rose-600 font-medium mt-1">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      {t("contact.message")} <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t("contact.messagePlaceholder")}
                      className={`w-full py-2.5 px-3.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errors.message ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                      }`}
                    />
                    {errors.message && (
                      <p className="text-xs text-rose-600 font-medium mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm shadow-xs transition-colors inline-flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t("contact.sending")}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t("contact.submitBtn")}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar Platform Info */}
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-base">
                {t("contact.supportInfoTitle")}
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">Support Desk Email</p>
                    <p className="mt-0.5">support@jansevaconnect.org.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">Hours of Operation</p>
                    <p className="mt-0.5">{t("contact.supportHours")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">Initiative Focus</p>
                    <p className="mt-0.5">Maharashtra & Pan-India Citizen Welfare</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Official RTI Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <Info className="w-4 h-4 text-amber-600" />
                <span>RTI & Formal Government Appeals</span>
              </div>
              <p className="leading-relaxed">
                {t("contact.disclaimerNote")}
              </p>
              <p className="pt-1 text-[11px] text-amber-800">
                JanSeva Connect is an independent public-interest platform and does not possess authority to adjudicate statutory appeals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
