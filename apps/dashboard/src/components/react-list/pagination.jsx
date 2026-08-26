"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination as PaginationRoot } from "ui/components/pagination";

export default function Pagination({
  page = 1,
  pagesCount = 1,
  perPage = 10,
  count = 0,
  setPage,
  maxVisiblePages = 3,
  className,
}) {
  const currentPage = Math.max(1, page);
  const totalPages = Math.max(1, pagesCount);

  const from = count === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, count);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
      return;
    }

    setPage(nextPage);
  };

  const getPageNumbers = () => {
    const pages = [];

    const windowSize = Math.max(1, maxVisiblePages);

    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));

    let end = start + windowSize - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - windowSize + 1);
    }

    // First page
    if (start > 1) {
      pages.push(1);

      if (start > 2) {
        pages.push("start-ellipsis");
      }
    }

    // Visible pages
    for (let pageNumber = start; pageNumber <= end; pageNumber++) {
      pages.push(pageNumber);
    }

    // Last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push("end-ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row",
        className
      )}
    >
      {/* Results */}
      <p className="text-muted-foreground text-sm">
        Showing <span className="text-foreground font-medium">{from}</span> to{" "}
        <span className="text-foreground font-medium">{to}</span> of{" "}
        <span className="text-foreground font-medium">{count}</span>
      </p>

      {/* Pagination */}
      <PaginationRoot
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
