import { Filter, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FilterPanel({
  status = "ALL",
  onStatusChange,
  category = "ALL",
  onCategoryChange,
  priority = "ALL",
  onPriorityChange,
  categories = [],
  departments = [],
  selectedCategory,
  selectedDepartment,
  selectedState,
  selectedStatus,
  onDepartmentChange,
  onStateChange,
  showDepartment = false,
  showState = false,
  onReset,
}) {
  const { t } = useTranslation();
  const effectiveStatus = selectedStatus ?? status;
  const effectiveCategory = selectedCategory ?? category;
  const statuses = ["ALL", "SUBMITTED", "UNDER_VERIFICATION", "ASSIGNED", "IN_PROGRESS", "RESOLUTION_SUBMITTED", "RESOLVED"];
  const priorities = ["ALL", "LOW", "MEDIUM", "HIGH", "EMERGENCY"];
  const categoryValue = (item) => item.category || item.name || item;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm"><Filter className="w-4 h-4 text-blue-600" /><span>Filters</span></div>
        {onReset && <button type="button" onClick={onReset} className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1"><RotateCcw className="w-3 h-3" />Reset</button>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {selectedStatus === undefined ? (
          <label className="block text-xs font-medium text-slate-600">Status
            <select value={effectiveStatus || ""} onChange={(e) => onStatusChange?.(e.target.value)} className="mt-1 w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2">
              {statuses.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
            </select>
          </label>
        ) : (
          <fieldset className="text-xs font-medium text-slate-600">
            <legend>Verification Status</legend>
            <div className="mt-1 space-y-1">
              {[["", "All Statuses"], ["true", "Verified only"], ["false", "Unverified"]].map(([value, label]) => (
                <label key={value || "all"} className="flex items-center gap-2 font-normal">
                  <input type="radio" name="verificationStatus" value={value} checked={selectedStatus === value} onChange={() => onStatusChange?.(value)} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label className="block text-xs font-medium text-slate-600">Category
          <select value={effectiveCategory || ""} onChange={(e) => onCategoryChange?.(e.target.value)} className="mt-1 w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2">
            <option value="">{t("services.categoryFilter")}</option>
            {categories.map((item) => <option key={categoryValue(item)} value={categoryValue(item)}>{item.label || categoryValue(item)}</option>)}
          </select>
        </label>
        {onPriorityChange && <label className="block text-xs font-medium text-slate-600">Priority
          <select value={priority} onChange={(e) => onPriorityChange(e.target.value)} className="mt-1 w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2">
            {priorities.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>}
        {showDepartment && <label className="block text-xs font-medium text-slate-600">Department
          <select value={selectedDepartment || ""} onChange={(e) => onDepartmentChange?.(e.target.value)} className="mt-1 w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2">
            <option value="">All Departments</option>
            {departments.map((item) => <option key={item.id || item} value={item.id || item}>{item.name || item.department_name || item}</option>)}
          </select>
        </label>}
        {showState && <label className="block text-xs font-medium text-slate-600">State
          <select value={selectedState || ""} onChange={(e) => onStateChange?.(e.target.value)} className="mt-1 w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2">
            <option value="">All States</option>
          </select>
        </label>}
      </div>
    </div>
  );
}

export default FilterPanel;
