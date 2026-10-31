import { SearchX, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EmptyState({
  title,
  description,
  onReset,
  resetLabel = "Clear All Filters",
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-xs max-w-lg mx-auto my-8">
      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
        <SearchX className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        {title || t("services.emptyTitle")}
      </h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">
        {description || t("services.emptyDesc")}
      </p>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{resetLabel}</span>
        </button>
      )}
    </div>
  );
}

export default EmptyState;
