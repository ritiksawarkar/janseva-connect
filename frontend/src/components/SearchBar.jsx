import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SearchBar({ value = "", onChange, onSearch, placeholder, className = "", size = "md" }) {
  const { t } = useTranslation();
  const [internalVal, setInternalVal] = useState(value);
  useEffect(() => setInternalVal(value), [value]);
  const handleChange = (nextValue) => {
    setInternalVal(nextValue);
    onChange?.(nextValue);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(internalVal);
  };
  const isLarge = size === "lg";
  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center w-full ${className}`}>
      <div className="relative w-full">
        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 ${isLarge ? "w-5 h-5" : "w-4 h-4"}`} />
        <input type="text" value={internalVal} onChange={(event) => handleChange(event.target.value)} placeholder={placeholder || t("home.searchPlaceholder")} className={`w-full pl-10 pr-10 bg-white border border-slate-300 rounded-lg ${isLarge ? "py-3.5 text-base" : "py-2.5 text-sm"}`} />
        {internalVal && <button type="button" onClick={() => handleChange("")} aria-label="Clear search input" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X className="w-4 h-4" /></button>}
      </div>
      <button type="submit" className={`ml-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0 ${isLarge ? "px-6 py-3.5 text-base" : "px-4 py-2.5 text-sm"}`}>{t("home.searchBtn")}</button>
    </form>
  );
}

export default SearchBar;
