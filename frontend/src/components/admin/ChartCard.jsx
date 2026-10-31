import React from "react";

export function ChartCard({ title, subtitle, action, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-800">{title}</h4>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </div>
  );
}

// Visual Bar Chart Component (Tailwind/SVG powered)
export function SimpleBarChart({ data = [], height = 180 }) {
  if (!data || data.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-8">No chart data available</p>;
  }

  const maxVal = Math.max(...data.map((d) => d.value || 0), 1);

  return (
    <div className="w-full flex items-end justify-between gap-2 pt-4 pb-2" style={{ height }}>
      {data.map((item, idx) => {
        const heightPct = Math.round(((item.value || 0) / maxVal) * 100);
        return (
          <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
            {/* Tooltip */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-slate-800 text-white text-[10px] py-1 px-1.5 rounded pointer-events-none whitespace-nowrap z-10">
              {item.label}: {item.value}
            </div>
            <div
              className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 ${item.color || "bg-blue-500 hover:bg-blue-600"}`}
              style={{ height: `${Math.max(heightPct, 6)}%` }}
            ></div>
            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[50px] mt-2 block text-center">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Distribution Progress Breakdown
export function DistributionList({ items = [] }) {
  const total = items.reduce((acc, i) => acc + (i.value || 0), 0) || 1;

  return (
    <div className="space-y-3 py-2">
      {items.map((item, idx) => {
        const pct = Math.round(((item.value || 0) / total) * 100);
        return (
          <div key={idx}>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700 flex items-center">
                <span className={`w-2.5 h-2.5 rounded-full mr-2 ${item.dotColor || "bg-blue-500"}`}></span>
                {item.label}
              </span>
              <span className="font-semibold text-slate-800">
                {item.value} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${item.barColor || "bg-blue-500"}`}
                style={{ width: `${pct}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChartCard;
