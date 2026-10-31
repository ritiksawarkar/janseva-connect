import { SearchX, RotateCcw, Inbox, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  message,
  onReset,
  resetLabel,
  actionLabel,
  actionLink,
  onAction,
}) {
  const { t } = useTranslation();
  const isPublicEmptyState = description !== undefined || onReset;
  const EmptyIcon = isPublicEmptyState ? SearchX : Icon;
  const body = description || message || t("services.emptyDesc");
  const label = resetLabel || actionLabel;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-6 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
        <EmptyIcon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title || t("services.emptyTitle")}</h3>
      <p className="text-sm text-slate-500 mt-1.5 max-w-xs">{body}</p>
      {label && actionLink && (
        <Link to={actionLink} className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl">
          <span>{label}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
      {label && !actionLink && (onAction || onReset) && (
        <button type="button" onClick={onAction || onReset} className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      )}
    </div>
  );
}

export default EmptyState;
