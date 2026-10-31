import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  pagination = { page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false },
  onPageChange
}) => {
  const { page, totalPages, total } = pagination;

  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 bg-white rounded-xl mt-4">
      <div className="text-xs text-slate-500">
        Page <span className="font-semibold text-slate-800">{page}</span> of{' '}
        <span className="font-semibold text-slate-800">{totalPages}</span> ({total} items)
      </div>

      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!pagination.hasPrev}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          Previous
        </button>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!pagination.hasNext}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
