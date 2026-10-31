import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  RotateCcw,
  Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";
import EligibilityStatusCard from "../components/EligibilityStatusCard";

export function EligibilityResults() {
  const { t } = useTranslation();
  const location = useLocation();

  // Try reading from navigation state or sessionStorage
  const navState = location.state;
  let resultData = navState?.resultData;
  let inputData = navState?.inputData;

  if (!resultData) {
    try {
      const storedRes = sessionStorage.getItem("lastEligibilityResult");
      const storedInput = sessionStorage.getItem("lastEligibilityInput");
      if (storedRes) resultData = JSON.parse(storedRes);
      if (storedInput) inputData = JSON.parse(storedInput);
    } catch (e) {
      console.error("Error reading stored eligibility results:", e);
    }
  }

  const [activeTab, setActiveTab] = useState("ALL");

  if (!resultData || !resultData.results) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Assessment Data Found</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          To receive personalized scheme eligibility matches, please provide your basic demographic details in our eligibility checker.
        </p>
        <div>
          <Link
            to="/eligibility-checker"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-xs"
          >
            <span>Start Eligibility Check</span>
          </Link>
        </div>
      </div>
    );
  }

  const results = resultData.results || [];
  const counts = resultData.counts || {
    likely: results.filter((r) => r.status === "LIKELY_ELIGIBLE").length,
    possibly: results.filter((r) => r.status === "POSSIBLY_ELIGIBLE").length,
    unlikely: results.filter((r) => r.status === "UNLIKELY_ELIGIBLE").length,
  };

  const filteredResults = results.filter((item) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "LIKELY") return item.status === "LIKELY_ELIGIBLE";
    if (activeTab === "POSSIBLY") return item.status === "POSSIBLY_ELIGIBLE";
    if (activeTab === "UNLIKELY") return item.status === "UNLIKELY_ELIGIBLE";
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title={t("results.title")}
        subtitle={t("results.subtitle")}
        breadcrumbs={[
          { path: "/eligibility-checker", label: t("nav.checker") },
          { label: "Results" },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* STATUTORY DISCLAIMER BANNER */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 sm:p-6 flex items-start gap-3.5 shadow-xs">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider">
              Statutory Disclaimer
            </h3>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              {resultData.disclaimer || t("results.disclaimer")}
            </p>
          </div>
        </div>

        {/* PROFILE RECAP & STATUS SUMMARY */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Evaluated Profile
            </span>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-medium text-slate-700">
              {inputData?.age && (
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">
                  Age: <strong className="text-slate-900">{inputData.age} yrs</strong>
                </span>
              )}
              {inputData?.state && (
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">
                  State: <strong className="text-slate-900">{inputData.state}</strong>
                </span>
              )}
              {inputData?.annualIncome !== undefined && (
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">
                  Income:{" "}
                  <strong className="text-slate-900">
                    ₹{inputData.annualIncome.toLocaleString("en-IN")}
                  </strong>
                </span>
              )}
              {inputData?.occupation && (
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">
                  Occupation: <strong className="text-slate-900">{inputData.occupation}</strong>
                </span>
              )}
            </div>
          </div>

          <Link
            to="/eligibility-checker"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("results.reCheck")}</span>
          </Link>
        </div>

        {/* STATUS TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Evaluated Schemes ({results.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("LIKELY")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === "LIKELY"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t("results.likelyEligible")} ({counts.likely})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("POSSIBLY")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === "POSSIBLY"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t("results.possiblyEligible")} ({counts.possibly})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("UNLIKELY")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === "UNLIKELY"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{t("results.unlikelyEligible")} ({counts.unlikely})</span>
          </button>
        </div>

        {/* RESULTS CARDS LIST */}
        <div className="space-y-6">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
              No schemes in this classification category.
            </div>
          ) : (
            filteredResults.map((result) => (
              <EligibilityStatusCard key={result.schemeId} result={result} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default EligibilityResults;
