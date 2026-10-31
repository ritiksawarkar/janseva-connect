import React from "react";
import { LoadingSkeleton, EmptyState } from "./UIControls";

export function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = "No data found",
  emptyDescription = "There are no records matching your criteria.",
  onRowClick
}) {
  if (isLoading) {
    return <LoadingSkeleton rows={6} columns={columns.length || 4} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className={`py-3.5 px-4 text-xs font-semibold text-slate-700 ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`hover:bg-slate-50/80 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`py-3.5 px-4 whitespace-nowrap text-slate-700 ${col.className || ""}`}
                >
                  {col.render
                    ? col.render(row)
                    : typeof col.accessor === "function"
                    ? col.accessor(row)
                    : row[col.accessor] !== undefined && row[col.accessor] !== null
                    ? String(row[col.accessor])
                    : "--"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
