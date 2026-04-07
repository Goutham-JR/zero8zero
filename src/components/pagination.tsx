"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  activeClass?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  activeClass = "gradient-bg text-white shadow-lg shadow-primary/25",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "dots")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("dots");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("dots");
    pages.push(totalPages);
  }

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border">
      <p className="text-xs text-muted">
        Showing {from}&ndash;{to} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block"
        >
          First
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        {pages.map((page, idx) =>
          page === "dots" ? (
            <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-muted text-sm">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                currentPage === page
                  ? activeClass
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block"
        >
          Last
        </button>
      </div>
    </div>
  );
}
