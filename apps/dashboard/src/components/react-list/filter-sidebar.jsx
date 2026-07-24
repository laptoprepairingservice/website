"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "ui/components/sheet";
import { Button } from "ui/components/button";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

/**
 * FilterSidebar - A reusable sidebar wrapper for filters with Apply and Clear functionality
 *
 * @param {boolean} open - Controls whether the sidebar is open
 * @param {function} onOpenChange - Callback when open state changes
 * @param {object} filters - Current filter values
 * @param {function} setFilters - Function to update filters
 * @param {function} clearFilters - Function to clear all filters
 * @param {object} defaultFilters - Default filter values
 * @param {boolean} hasActiveFilters - Whether any filters are currently active
 * @param {function} renderFilters - Function that renders filter form content
 * @param {string} title - Title for the sidebar header (default: "Filters")
 * @param {string} className - Additional className for the content area
 */
export default function FilterSidebar({
  open,
  onOpenChange,
  filters,
  setFilters,
  clearFilters,
  defaultFilters = {},
  hasActiveFilters = false,
  renderFilters,
  title = "Filters",
  className,
}) {
  // Local state to track filter changes before applying
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync local filters when filters prop changes or sidebar opens
  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [filters, open]);

  const handleApply = () => {
    setFilters(localFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    const clearedFilters = defaultFilters || {};
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalFilters(filters);
  };

  // Check if local filters differ from current filters
  const hasChanges = JSON.stringify(localFilters) !== JSON.stringify(filters);
  const hasLocalFilters = Object.keys(localFilters || {}).some(
    (key) =>
      localFilters[key] !== null &&
      localFilters[key] !== undefined &&
      localFilters[key] !== "",
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn("flex flex-col gap-0 p-0", className)}
        side="right"
      >
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold flex items-center justify-between gap-2">
            <Icon icon="mdi:filter" className="size-6" />
            <div>{title}</div>
          </SheetTitle>
          {hasActiveFilters && (
            <p className="text-sm text-muted-foreground mt-1">
              {
                Object.keys(filters).filter(
                  (key) =>
                    filters[key] !== null &&
                    filters[key] !== undefined &&
                    filters[key] !== "",
                ).length
              }{" "}
              active filter(s)
            </p>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {renderFilters &&
            renderFilters({
              filters: localFilters,
              setFilters: setLocalFilters,
              setIsOpen: onOpenChange,
              isOpen: open,
              defaultFilters: defaultFilters,
              clearFilters: handleClear,
            })}
        </div>

        <SheetFooter className="border-t p-4 gap-2 flex-row justify-between sm:justify-between">
          <div className="flex gap-2">
            {hasChanges && (
              <Button
                variant="ghost"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <Icon icon="mdi:refresh" className="size-4" />
                Reset
              </Button>
            )}
            {(hasLocalFilters || hasActiveFilters) && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex items-center gap-2"
              >
                <Icon icon="mdi:filter-off" className="size-4" />
                Clear All
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {!hasChanges && (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-2"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleApply}
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Icon icon="mdi:check" className="size-4" />
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
