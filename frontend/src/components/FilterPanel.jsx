import { Filter, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FilterPanel({
  categories = [],
  departments = [],
  selectedCategory,
  selectedDepartment,
  selectedState,
  selectedStatus,
  onCategoryChange,
  onDepartmentChange,
  onStateChange,
  onStatusChange,
  onReset,
  showDepartment = true,
  showState = false,
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Category
          </label>
          <select
            value={selectedCategory || ""}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          >
            <option value="">{t("services.categoryFilter")}</option>
            {categories.map((c) => (
              <option key={c.category || c} value={c.category || c}>
                {c.category || c} {c.count ? `(${c.count})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Department Filter (Services) */}
      {showDepartment && departments.length > 0 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Department
          </label>
          <select
            value={selectedDepartment || ""}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 truncate"
          >
            <option value="">{t("services.departmentFilter")}</option>
            {departments.map((d) => (
              <option key={d.id || d.name} value={d.id || d.name}>
                {d.name} {d.service_count ? `(${d.service_count})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* State Filter (Schemes) */}
      {showState && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            State / Jurisdiction
          </label>
          <select
            value={selectedState || ""}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          >
            <option value="">{t("schemes.stateFilter")}</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="All India">All India (Central)</option>
          </select>
        </div>
      )}

      {/* Verification Status */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          {t("services.statusFilter")}
        </label>
        <div className="space-y-1.5 text-sm text-slate-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="verificationStatus"
              value=""
              checked={!selectedStatus}
              onChange={() => onStatusChange("")}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>{t("services.allStatus")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="verificationStatus"
              value="true"
              checked={selectedStatus === "true"}
              onChange={() => onStatusChange("true")}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-emerald-700 font-medium">{t("services.verifiedOnly")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="verificationStatus"
              value="false"
              checked={selectedStatus === "false"}
              onChange={() => onStatusChange("false")}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-amber-700">Demo / Unverified</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
