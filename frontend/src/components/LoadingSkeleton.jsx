export function LoadingSkeleton({ count = 3, type = "card" }) {
  if (type === "table") {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
        <div className="h-10 bg-slate-100 border-b border-slate-200" />
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="h-14 border-b border-slate-100 p-4 flex items-center justify-between">
            <div className="w-1/4 h-4 bg-slate-200 rounded" />
            <div className="w-1/3 h-4 bg-slate-200 rounded" />
            <div className="w-1/6 h-4 bg-slate-200 rounded" />
            <div className="w-16 h-6 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs animate-pulse space-y-3">
          <div className="flex items-center justify-between"><div className="w-28 h-4 bg-slate-200 rounded" /><div className="w-20 h-5 bg-slate-200 rounded-full" /></div>
          <div className="w-3/4 h-5 bg-slate-200 rounded" />
          <div className="w-full h-3 bg-slate-100 rounded" />
          <div className="w-2/3 h-3 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
