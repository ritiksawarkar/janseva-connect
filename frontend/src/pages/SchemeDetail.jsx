import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Award,
  Building2,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  ListOrdered,
  Users,
  ArrowLeft,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { schemeApi } from "../api";
import PageHeader from "../components/PageHeader";
import VerificationBadge from "../components/VerificationBadge";
import SourceInformation from "../components/SourceInformation";
import ErrorState from "../components/ErrorState";

export function SchemeDetail() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    schemeApi
      .getById(id)
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && res.data.scheme) {
          setScheme(res.data.scheme);
          setError(null);
        } else {
          setError(res.data?.message || "Government scheme details not found.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching scheme details:", err);
        setError("Unable to load government scheme information.");
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

  if (error || !scheme) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState message={error || "Scheme not found"} onRetry={handleRetry} />
        <div className="text-center mt-4">
          <Link
            to="/schemes"
            className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Schemes Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const documents = Array.isArray(scheme.documents) ? scheme.documents : [];
  const steps = Array.isArray(scheme.application_steps) ? scheme.application_steps : [];
  const rules = Array.isArray(scheme.rules) ? scheme.rules : [];

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title={scheme.name}
        subtitle={`${scheme.category} &bull; ${scheme.scheme_level || "Central"} Scheme &bull; ${scheme.state}`}
        breadcrumbs={[
          { path: "/schemes", label: t("nav.schemes") },
          { label: scheme.name },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2-Column Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* OVERVIEW */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {scheme.category}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {scheme.scheme_level}
                  </span>
                </div>
                <VerificationBadge
                  isVerified={scheme.is_verified}
                  verifiedDate={scheme.last_verified_at}
                />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                {t("detail.overview")}
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {scheme.description}
              </p>

              {scheme.beneficiary_group && (
                <div className="pt-2 flex items-center gap-2 text-xs text-slate-600">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-800">Target Beneficiary:</span>
                  <span>{scheme.beneficiary_group}</span>
                </div>
              )}
            </section>

            {/* OBJECTIVES */}
            {scheme.objectives && (
              <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {t("detail.objectives")}
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {scheme.objectives}
                </p>
              </section>
            )}

            {/* BENEFITS */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Award className="w-5 h-5 text-emerald-600" />
                <h2>{t("detail.benefits")}</h2>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 text-sm text-emerald-950 font-medium leading-relaxed">
                {scheme.benefits}
              </div>
            </section>

            {/* ELIGIBILITY RULES BREAKDOWN */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h2>{t("detail.eligibility")}</h2>
              </div>

              {scheme.eligibility_description && (
                <p className="text-sm text-slate-700 leading-relaxed">
                  {scheme.eligibility_description}
                </p>
              )}

              {/* Concrete Rule-Based Requirements List */}
              {rules.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Statutory Rule Checklist
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">{rule.description}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Rule: {rule.rule_type} ({rule.is_mandatory ? "Mandatory" : "Optional"})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* REQUIRED DOCUMENTS */}
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
                  Document guidelines not published in verified summary.
                </p>
              )}
            </section>

            {/* APPLICATION PROCEDURE */}
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
                  Step-by-step application instructions not available.
                </p>
              )}
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Primary Action Box: Apply on Official Website */}
            <div className="bg-emerald-700 text-white rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold">Apply on Official Portal</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Connect directly to the verified government portal to register or lodge your scheme application.
              </p>

              {scheme.official_application_url ? (
                <a
                  href={scheme.official_application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-800 font-bold text-sm hover:bg-emerald-50 transition-colors shadow-xs"
                >
                  <span>{t("detail.applyNow")}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div className="p-3 bg-emerald-800/80 rounded-lg text-xs text-emerald-200 text-center">
                  Official online application link not available.
                </div>
              )}

              {/* Check Eligibility Button */}
              <Link
                to="/eligibility-checker"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs border border-emerald-600 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t("detail.checkEligibility")}</span>
              </Link>
            </div>

            {/* Department Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3>{t("detail.department")}</h3>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {scheme.responsible_department || scheme.department_name || "Government Department"}
              </p>
            </div>

            {/* SOURCE INFORMATION */}
            <SourceInformation
              sourceUrl={scheme.source_url}
              verifiedDate={scheme.last_verified_at}
              departmentName={scheme.responsible_department || scheme.department_name}
            />

            {/* Statutory Disclaimer Alert */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Indicative Eligibility Notice</span>
              </div>
              <p className="leading-relaxed">
                Eligibility information displayed is indicative and intended for citizen guidance. Final approval and disbursement are strictly determined by the responsible government authority upon physical/biometric verification of statutory documents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchemeDetail;
