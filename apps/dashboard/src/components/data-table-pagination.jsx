"use client";

import { Button } from "ui/components/button";

export function DataTablePagination({
  table,
  totalResult = 0,
  currentPage = 1,
  lastPage = 1,
  onPageChange,
}) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < lastPage;

  const handlePrevious = () => {
    if (canGoPrevious && onPageChange) {
      onPageChange(currentPage - 1);
    } else if (canGoPrevious && table) {
      table.previousPage();
    }
  };

  const handleNext = () => {
    if (canGoNext && onPageChange) {
      onPageChange(currentPage + 1);
    } else if (canGoNext && table) {
      table.nextPage();
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="text-sm text-muted-foreground">
        {totalResult} {totalResult === 1 ? "result" : "results"}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {lastPage || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!canGoNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
