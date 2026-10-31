import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  pagination,
  currentPage = pagination?.page || 1,
  totalPages = pagination?.totalPages || 1,
  onPageChange,
  hasNext = pagination?.hasNext,
  hasPrev = pagination?.hasPrev,
}) {
  if (!totalPages || totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  for (let page = start; page <= Math.min(totalPages, start + 4); page += 1) pages.push(page);
  return (
    <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Pagination">
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={hasPrev === false || currentPage <= 1} aria-label="Previous Page" className="p-2 rounded-lg border border-slate-300 bg-white disabled:opacity-40">
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((page) => (
        <button key={page} type="button" onClick={() => onPageChange(page)} className={`w-9 h-9 rounded-lg text-xs font-semibold ${page === currentPage ? "bg-blue-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>
          {page}
        </button>
      ))}
      <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={hasNext === false || currentPage >= totalPages} aria-label="Next Page" className="p-2 rounded-lg border border-slate-300 bg-white disabled:opacity-40">
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

export default Pagination;
