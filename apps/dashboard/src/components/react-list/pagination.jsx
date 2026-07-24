"use client";

import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination as PaginationRoot,
} from "ui/components/pagination";

export default function Pagination({
  page,
  pagesCount,
  perPage,
  count,
  pagesToDisplay = [1, 2, 3],
  setPage,
  next,
  prev,
  first,
  last,
}) {
  const current_page = page;
  const last_page = pagesCount;
  const per_page = perPage;
  const total = count;

  const MAX_BUTTONS = 3;
  const from = (page - 1) * per_page + 1;
  const to = Math.min(page * per_page, total);

  const handlePageChange = (p, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (p >= 1 && p <= last_page && p !== current_page) {
      setPage(p);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const windowSize = MAX_BUTTONS;

    // --- calculate sliding window ---
    let start = Math.max(1, current_page - Math.floor(windowSize / 2));
    let end = start + windowSize - 1;

    if (end > last_page) {
      end = last_page;
      start = Math.max(1, end - windowSize + 1);
    }

    // --- Always show "1" ---
    if (start > 1) {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink href="#" onClick={(e) => handlePageChange(1, e)}>
            1
          </PaginationLink>
        </PaginationItem>,
      );

      if (start > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
    }

    // --- Window pages ---
    for (let p = start; p <= end; p++) {
      pages.push(
        <PaginationItem key={p}>
          <PaginationLink
            href="#"
            isActive={p === current_page}
            onClick={(e) => handlePageChange(p, e)}
          >
            {p}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    // --- Always show last page ---
    if (end < last_page) {
      if (end < last_page - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      pages.push(
        <PaginationItem key={last_page}>
          <PaginationLink
            href="#"
            onClick={(e) => handlePageChange(last_page, e)}
          >
            {last_page}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return pages;
  };

  if (pagesCount <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {from} to {to} of {total}
      </div>

      <div className="flex items-center gap-4">
        <PaginationRoot>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => handlePageChange(current_page - 1, e)}
                className={
                  current_page === 1 ? "opacity-50 pointer-events-none" : ""
                }
              />
            </PaginationItem>

            {renderPageNumbers()}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => handlePageChange(current_page + 1, e)}
                className={
                  current_page === last_page
                    ? "opacity-50 pointer-events-none"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </PaginationRoot>
      </div>
    </div>
  );
}
