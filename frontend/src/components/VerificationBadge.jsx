import { CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function VerificationBadge({ isVerified, verifiedDate, size = "md" }) {
  const { t } = useTranslation();

  if (isVerified) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${
          size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs"
        }`}
        title={verifiedDate ? `Verified on ${new Date(verifiedDate).toLocaleDateString()}` : "Verified official government record"}
      >
        <CheckCircle2 className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
        <span>{t("common.verified")} Official</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs"
      }`}
      title="Sample or unverified record"
    >
      <AlertCircle className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      <span>Demo / {t("common.unverified")}</span>
    </span>
  );
}

export default VerificationBadge;
