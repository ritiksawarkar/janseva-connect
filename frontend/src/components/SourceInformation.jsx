import { ExternalLink, ShieldCheck, Calendar, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SourceInformation({
  sourceUrl,
  verifiedDate,
  departmentName,
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-700">
      <div className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
        <span>{t("detail.sourceInfo")}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {departmentName && (
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              {t("detail.department")}
            </p>
            <p className="font-semibold text-slate-800 mt-0.5">{departmentName}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {t("detail.lastUpdated")}
          </p>
          <div className="flex items-center gap-1.5 font-medium text-slate-800 mt-0.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {verifiedDate
                ? new Date(verifiedDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "October 31, 2026"}
            </span>
          </div>
        </div>

        {sourceUrl && (
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
              Official Reference Source
            </p>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium underline break-all"
            >
              <span>{sourceUrl}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 flex items-start gap-2 text-xs text-slate-500">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          {t("detail.disclaimer")}
        </p>
      </div>
    </div>
  );
}

export default SourceInformation;
