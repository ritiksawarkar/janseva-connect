import {
  FileText,
  GraduationCap,
  HeartPulse,
  Droplet,
  Landmark,
  Receipt,
  Users2,
  Wheat,
  Home,
  Briefcase,
  Layers,
} from "lucide-react";

const iconMap = {
  Certificates: FileText,
  Education: GraduationCap,
  Health: HeartPulse,
  "Water Supply": Droplet,
  "Municipal Services": Landmark,
  "Tax and Revenue": Receipt,
  "Social Welfare": Users2,
  Agriculture: Wheat,
  "Women & Child Welfare": Users2,
  Housing: Home,
  Employment: Briefcase,
};

export function CategoryCard({ category, count, isSelected, onClick }) {
  const IconComponent = iconMap[category] || Layers;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 w-full ${
        isSelected
          ? "bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-600"
          : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-sm line-clamp-1">{category}</p>
          {typeof count === "number" && (
            <p className="text-xs text-slate-500 mt-0.5">{count} listings</p>
          )}
        </div>
      </div>
    </button>
  );
}

export default CategoryCard;
