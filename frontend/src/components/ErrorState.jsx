import { AlertCircle, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ErrorState({ title, message, onRetry }) {
  const { t } = useTranslation();
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto my-8">
      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-900">{title || t("common.error")}</h3>
      <p className="text-sm text-rose-700 mt-1">{message || "We encountered an issue fetching data. Please verify your connection."}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t("common.retry")}</span>
        </button>
      )}
    </div>
  );
}

export default ErrorState;
