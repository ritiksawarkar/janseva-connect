import { Link } from "react-router-dom";
import { Building2, ArrowRight, IndianRupee } from "lucide-react";
import { useTranslation } from "react-i18next";
import VerificationBadge from "./VerificationBadge";

export function ServiceCard({ service }) {
  const { t } = useTranslation();
  const {
    id,
    name,
    slug,
    description,
    category,
    department_name,
    fees,
    is_verified,
    official_application_url,
  } = service;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {category}
          </span>
          <VerificationBadge isVerified={is_verified} size="sm" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
          <Link to={`/services/${slug || id}`}>
            {name}
          </Link>
        </h3>

        <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {description}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          {department_name && (
            <div className="flex items-start gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{department_name}</span>
            </div>
          )}

          {fees && (
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="line-clamp-1">{fees}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/services/${slug || id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>{t("services.viewDetails")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {official_application_url && (
          <span className="text-[11px] text-slate-500 font-medium">
            Online RTS Portal
          </span>
        )}
      </div>
    </div>
  );
}

export default ServiceCard;
