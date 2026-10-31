import { useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder,
  className = "",
  size = "md",
}) {
  const { t } = useTranslation();
  const [internalVal, setInternalVal] = useState(value || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(internalVal);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInternalVal(val);
    if (onChange) {
      onChange(val);
    }
  };

  const handleClear = () => {
    setInternalVal("");
    if (onChange) onChange("");
    if (onSearch) onSearch("");
  };

  const isLarge = size === "lg";

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center w-full ${className}`}>
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className={isLarge ? "w-5 h-5" : "w-4 h-4"} />
        </div>

        <input
          type="text"
          value={internalVal}
          onChange={handleChange}
          placeholder={placeholder || t("home.searchPlaceholder")}
          className={`w-full pl-10 pr-10 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-shadow ${
            isLarge ? "py-3.5 text-base shadow-sm" : "py-2.5 text-sm"
          }`}
        />

        {internalVal && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        type="submit"
        className={`ml-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shrink-0 shadow-xs ${
          isLarge ? "px-6 py-3.5 text-base" : "px-4 py-2.5 text-sm"
        }`}
      >
        {t("home.searchBtn")}
      </button>
    </form>
  );
}

export default SearchBar;
