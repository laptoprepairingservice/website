"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@ui/shadcn/components/sheet";
import { FilterFormContent } from "./filter-form-content";
import { cn } from "@/lib/utils";

/**
 * MobileFilterHeader - Renders strictly on mobile in the page header
 * Shows filter button and opens slide-out Sheet drawer with direct live filtering.
 */
export function MobileFilterHeader({
  categories = [],
  brands = [],
  activeBrandSlug = "",
  activeCategorySlug = "",
  className,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sheetOpen, setSheetOpen] = useState(false);

  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") === "true";
  const sort = searchParams.get("sort") || "relevance";

  // Local state for debounced Min/Max price inputs
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);

  useEffect(() => {
    setMinPriceInput(minPriceParam);
  }, [minPriceParam]);

  useEffect(() => {
    setMaxPriceInput(maxPriceParam);
  }, [maxPriceParam]);

  // Central filter update helper that updates URL immediately
  const updateFilter = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          value === false ||
          (key === "sort" && value === "relevance")
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Debounce user keystrokes for custom Min/Max price inputs (~400ms)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (minPriceInput === minPriceParam && maxPriceInput === maxPriceParam) {
      return;
    }

    const timer = setTimeout(() => {
      updateFilter({ minPrice: minPriceInput, maxPrice: maxPriceInput });
    }, 400);

    return () => clearTimeout(timer);
  }, [minPriceInput, maxPriceInput, minPriceParam, maxPriceParam, updateFilter]);

  // Preset button handler
  const handlePresetPrice = (min, max) => {
    if (minPriceParam === min && maxPriceParam === max) {
      setMinPriceInput("");
      setMaxPriceInput("");
      updateFilter({ minPrice: "", maxPrice: "" });
    } else {
      setMinPriceInput(min);
      setMaxPriceInput(max);
      updateFilter({ minPrice: min, maxPrice: max });
    }
  };

  const handleClearAll = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push(pathname, { scroll: false });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeCategorySlug) count += 1;
    if (minPriceParam || maxPriceParam) count += 1;
    if (inStock) count += 1;
    if (sort && sort !== "relevance") count += 1;
    return count;
  }, [activeCategorySlug, minPriceParam, maxPriceParam, inStock, sort]);

  return (
    <div className={cn("block lg:hidden", className)}>
      {/* Mobile Header Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSheetOpen(true)}
        className="border-border/80 bg-background/80 hover:bg-muted/60 relative flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-medium shadow-2xs backdrop-blur-xs cursor-pointer"
        aria-label="Open product filters"
      >
        <SlidersHorizontal className="text-primary size-3.5" />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <Badge
            variant="default"
            className="size-4.5 rounded-full p-0 text-[10px] justify-center"
          >
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {/* Slide-out Mobile Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="flex max-h-[85vh] flex-col p-0 rounded-t-3xl">
          {/* Header */}
          <SheetHeader className="border-border/70 flex flex-row items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="text-primary size-4" />
              <SheetTitle className="text-foreground text-base font-bold">Filters</SheetTitle>
              {activeFiltersCount > 0 && (
                <Badge
                  variant="default"
                  className="size-5 rounded-full p-0 text-[10px] justify-center"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer mr-6"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            )}
          </SheetHeader>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto px-5 py-2">
            <FilterFormContent
              categories={categories}
              brands={brands}
              activeBrandSlug={activeBrandSlug}
              activeCategorySlug={activeCategorySlug}
              minPriceInput={minPriceInput}
              setMinPriceInput={setMinPriceInput}
              maxPriceInput={maxPriceInput}
              setMaxPriceInput={setMaxPriceInput}
              inStock={inStock}
              sort={sort}
              onFilterChange={updateFilter}
              onPresetPrice={handlePresetPrice}
              idPrefix="mobile"
              onNavigate={() => setSheetOpen(false)}
            />
          </div>

          {/* Footer */}
          <SheetFooter className="border-border/70 border-t p-4 flex flex-row gap-3">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="flex-1 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Reset All
              </Button>
            )}
            <Button
              onClick={() => setSheetOpen(false)}
              className="flex-1 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Done
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
