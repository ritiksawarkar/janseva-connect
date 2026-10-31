import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  Building2,
  ExternalLink,
  CheckCircle2,
  IndianRupee,
  ShieldCheck,
  ListOrdered,
  ArrowLeft,
  Mail,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { serviceApi } from "../api";
import PageHeader from "../components/PageHeader";
import VerificationBadge from "../components/VerificationBadge";
import SourceInformation from "../components/SourceInformation";
import ErrorState from "../components/ErrorState";

export function ServiceDetail() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    serviceApi
      .getById(id)
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && res.data.service) {
          setService(res.data.service);
          setError(null);
        } else {
          setError(res.data?.message || "Service details not found.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching service details:", err);
        setError("Unable to load public service information from server.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, reloadKey]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-36 bg-slate-200 rounded" />
          <div className="h-10 w-3/4 bg-slate-200 rounded" />
          <div className="h-40 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState message={error || "Service not found"} onRetry={handleRetry} />
        <div className="text-center mt-4">
          <Link
            to="/services"
            className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Services Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const documents = Array.isArray(service.documents) ? service.documents : [];
  const steps = Array.isArray(service.application_steps) ? service.application_steps : [];

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title={service.name}
        subtitle={`${service.category} &bull; Maharashtra Right to Public Services`}
        breadcrumbs={[
          { path: "/services", label: t("nav.services") },
          { label: service.name },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2-Column Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. OVERVIEW */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {service.category}
                </span>
                <VerificationBadge
                  isVerified={service.is_verified}
                  verifiedDate={service.updated_at}
                />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                {t("detail.overview")}
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {service.description}
              </p>
            </section>

            {/* 2. ELIGIBILITY CRITERIA */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2>{t("detail.eligibility")}</h2>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                {service.eligibility || "Information not verified. Consult official department notification."}
              </p>
            </section>

            {/* 3. REQUIRED DOCUMENTS */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2>{t("detail.documents")}</h2>
              </div>

              {documents.length > 0 ? (
                <ul className="space-y-2.5">
                  {documents.map((doc, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50/70 p-3 rounded-lg border border-slate-100"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  Document checklist not available in verified records.
                </p>
              )}
            </section>

            {/* 4. APPLICATION PROCESS */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <ListOrdered className="w-5 h-5 text-blue-600" />
                <h2>{t("detail.process")}</h2>
              </div>

              {steps.length > 0 ? (
                <ol className="space-y-3 relative border-l-2 border-blue-200 ml-4 pl-4">
                  {steps.map((step, idx) => (
                    <li key={idx} className="relative">
                      <span className="absolute -left-[25px] top-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  Application procedure not available.
                </p>
              )}
            </section>

            {/* 5. FEES */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                <h2>{t("detail.fees")}</h2>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 text-sm text-emerald-950 font-medium">
                {service.fees || "Free of charge / Not specified"}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Direct Official Apply CTA Box */}
            <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold">Apply for This Public Service</h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Click below to open the official Maharashtra government citizen delivery portal (Aaple Sarkar / Urban Council).
              </p>

              {service.official_application_url ? (
                <a
                  href={service.official_application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-colors shadow-xs"
                >
                  <span>{t("detail.applyNow")}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div className="p-3 bg-blue-700/60 rounded-lg text-xs text-blue-200 text-center">
                  Official online application link not available.
                </div>
              )}

              <p className="text-[11px] text-blue-200 text-center">
                Redirects to secure official government portal
              </p>
            </div>

            {/* 6. RESPONSIBLE DEPARTMENT */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3>{t("detail.department")}</h3>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {service.department_name || "Revenue Department, Maharashtra"}
              </p>
              {service.department_description && (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {service.department_description}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                {service.department_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{service.department_email}</span>
                  </div>
                )}
                {service.department_website && (
                  <a
                    href={service.department_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Official Department Portal</span>
                  </a>
                )}
              </div>
            </div>

            {/* 8 & 9. SOURCE INFORMATION & VERSION SNAPSHOT */}
            <SourceInformation
              sourceUrl={service.official_source_url}
              verifiedDate={service.updated_at}
              departmentName={service.department_name}
            />

            {/* Version Metadata Badge */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Record Version:</span>
                <span className="font-semibold text-slate-700">v{service.current_version || 1}.0</span>
              </div>
              <div className="flex justify-between">
                <span>RTS Service Act:</span>
                <span className="font-semibold text-slate-700">Covered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetail;
