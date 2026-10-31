import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import VerificationBadge from "./VerificationBadge";

export function EligibilityStatusCard({ result }) {
  const { t } = useTranslation();
  const {
    schemeName,
    slug,
    category,
    schemeLevel,
    beneficiaryGroup,
    officialApplicationUrl,
    isVerified,
    status,
    matchedCriteria = [],
    unmatchedCriteria = [],
    unknownCriteria = [],
    reason,
  } = result;

  const statusConfig = {
    LIKELY_ELIGIBLE: {
      badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-300",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      title: t("results.likelyEligible"),
      barColor: "bg-emerald-500",
    },
    POSSIBLY_ELIGIBLE: {
      badgeBg: "bg-amber-50 text-amber-800 border-amber-300",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      title: t("results.possiblyEligible"),
      barColor: "bg-amber-500",
    },
    UNLIKELY_ELIGIBLE: {
      badgeBg: "bg-rose-50 text-rose-800 border-rose-300",
      icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      title: t("results.unlikelyEligible"),
      barColor: "bg-rose-500",
    },
  }[status] || {
    badgeBg: "bg-slate-50 text-slate-800 border-slate-300",
    icon: <AlertTriangle className="w-5 h-5 text-slate-600 shrink-0" />,
    title: status,
    barColor: "bg-slate-500",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300">
      <div className={`h-1.5 w-full ${statusConfig.barColor}`} />

      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {category}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {schemeLevel}
              </span>
              <VerificationBadge isVerified={isVerified} size="sm" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{schemeName}</h3>
            {beneficiaryGroup && (
              <p className="text-xs text-slate-500 mt-1">Beneficiary: {beneficiaryGroup}</p>
            )}
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${statusConfig.badgeBg}`}
          >
            {statusConfig.icon}
            <span>{statusConfig.title}</span>
          </div>
        </div>

        {reason && (
          <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Analysis: </span>
            {reason}
          </div>
        )}

        {/* Breakdown of Criteria */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Matched */}
          <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
            <p className="font-bold text-emerald-900 mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {t("results.matchedCriteria")} ({matchedCriteria.length})
            </p>
            {matchedCriteria.length > 0 ? (
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                {matchedCriteria.map((c, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 italic">No specific checks satisfied</p>
            )}
          </div>

          {/* Unmatched */}
          <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-100">
            <p className="font-bold text-rose-900 mb-1.5 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              {t("results.unmatchedCriteria")} ({unmatchedCriteria.length})
            </p>
            {unmatchedCriteria.length > 0 ? (
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                {unmatchedCriteria.map((c, idx) => (
                  <li key={idx} className="leading-relaxed text-rose-800">
                    {c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 italic">None failed</p>
            )}
          </div>

          {/* Unknown / Needs verification */}
          <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
            <p className="font-bold text-amber-900 mb-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {t("results.unknownCriteria")} ({unknownCriteria.length})
            </p>
            {unknownCriteria.length > 0 ? (
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                {unknownCriteria.map((c, idx) => (
                  <li key={idx} className="leading-relaxed text-amber-900">
                    {c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 italic">All evaluated</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/schemes/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>{t("results.viewScheme")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {officialApplicationUrl && (
            <a
              href={officialApplicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>{t("results.applyOfficial")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default EligibilityStatusCard;
