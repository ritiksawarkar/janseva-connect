import { Link } from "react-router-dom";
import { Users, Award, ArrowRight, ShieldCheck, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import VerificationBadge from "./VerificationBadge";

export function SchemeCard({ scheme }) {
  const { t } = useTranslation();
  const {
    id,
    name,
    slug,
    description,
    benefits,
    category,
    scheme_level,
    state,
    beneficiary_group,
    is_verified,
  } = scheme;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {category}
            </span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {scheme_level || "Central"}
            </span>
          </div>
          <VerificationBadge isVerified={is_verified} size="sm" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
          <Link to={`/schemes/${slug || id}`}>
            {name}
          </Link>
        </h3>

        <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {benefits && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950 font-medium">
            <div className="flex items-start gap-1.5">
              <Award className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{benefits}</span>
            </div>
          </div>
        )}

        <div className="mt-3 space-y-1 text-xs text-slate-500">
          {beneficiary_group && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{beneficiary_group}</span>
            </div>
          )}
          {state && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{state}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/schemes/${slug || id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>{t("schemes.viewDetails")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          to="/eligibility-checker"
          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t("home.checkEligibility")}</span>
        </Link>
      </div>
    </div>
  );
}

export default SchemeCard;
