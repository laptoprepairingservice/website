"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

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
 * Shows tiny filter button and opens slide-out Sheet drawer with Apply / Clear buttons
 */
export function MobileFilterHeader({
  categories = [],
  brands = [],
  activeCategorySlug = "",
  className,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sheetOpen, setSheetOpen] = useState(false);

  const currentBrands = useMemo(() => {
    const raw = searchParams.get("brand");
    return raw
      ? raw
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      : [];
  }, [searchParams]);

  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentInStock = searchParams.get("inStock") === "true";
  const currentSort = searchParams.get("sort") || "relevance";

  const [stagedBrands, setStagedBrands] = useState(currentBrands);
  const [stagedMinPrice, setStagedMinPrice] = useState(currentMinPrice);
  const [stagedMaxPrice, setStagedMaxPrice] = useState(currentMaxPrice);
  const [stagedInStock, setStagedInStock] = useState(currentInStock);
  const [stagedSort, setStagedSort] = useState(currentSort);

  useEffect(() => {
    setStagedBrands(currentBrands);
    setStagedMinPrice(currentMinPrice);
    setStagedMaxPrice(currentMaxPrice);
    setStagedInStock(currentInStock);
    setStagedSort(currentSort);
  }, [
    currentBrands,
    currentMinPrice,
    currentMaxPrice,
    currentInStock,
    currentSort,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (stagedBrands.length > 0) count += stagedBrands.length;
    if (stagedMinPrice || stagedMaxPrice) count += 1;
    if (stagedInStock) count += 1;
    if (stagedSort && stagedSort !== "relevance") count += 1;
    return count;
  }, [
    stagedBrands,
    stagedMinPrice,
    stagedMaxPrice,
    stagedInStock,
    stagedSort,
  ]);

  const handleApply = () => {
    const params = new URLSearchParams();

    if (stagedBrands.length > 0) {
      params.set("brand", stagedBrands.join(","));
    }
    if (stagedMinPrice) {
      params.set("minPrice", stagedMinPrice);
    }
    if (stagedMaxPrice) {
      params.set("maxPrice", stagedMaxPrice);
    }
    if (stagedInStock) {
      params.set("inStock", "true");
    }
    if (stagedSort && stagedSort !== "relevance") {
      params.set("sort", stagedSort);
    }

    const qs = params.toString();
    setSheetOpen(false);
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  const handleClearAll = () => {
    setStagedBrands([]);
    setStagedMinPrice("");
    setStagedMaxPrice("");
    setStagedInStock(false);
    setStagedSort("relevance");
    setSheetOpen(false);
    router.push(pathname);
  };

  return (
    <div className={cn("flex items-center gap-2 lg:hidden", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSheetOpen(true)}
        className="border-border text-foreground hover:bg-muted/50 relative h-9 gap-1.5 rounded-full px-3 text-xs font-semibold cursor-pointer"
        aria-label="Open filter options"
      >
        <SlidersHorizontal className="size-3.5" />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <Badge
            variant="default"
            className="size-4.5 rounded-full p-0 text-[10px] justify-center ml-0.5"
          >
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {/* Slide-out Mobile Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="left"
          className="bg-background border-border flex h-full w-[88vw] max-w-sm flex-col p-0"
        >
          <SheetHeader className="border-border/70 border-b px-4 py-3.5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="text-primary size-4" />
                <SheetTitle className="text-sm font-bold">Filters</SheetTitle>
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="size-5 rounded-full p-0 text-[10px] justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-muted-foreground hover:text-foreground text-xs font-medium transition cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </SheetHeader>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <FilterFormContent
              categories={categories}
              brands={brands}
              activeCategorySlug={activeCategorySlug}
              stagedBrands={stagedBrands}
              setStagedBrands={setStagedBrands}
              stagedMinPrice={stagedMinPrice}
              setStagedMinPrice={setStagedMinPrice}
              stagedMaxPrice={stagedMaxPrice}
              setStagedMaxPrice={setStagedMaxPrice}
              stagedInStock={stagedInStock}
              setStagedInStock={setStagedInStock}
              stagedSort={stagedSort}
              setStagedSort={setStagedSort}
              idPrefix="mobile"
              onNavigate={() => setSheetOpen(false)}
            />
          </div>

          {/* Footer Action Buttons */}
          <SheetFooter className="border-border/70 bg-card/60 border-t p-3">
            <div className="flex w-full items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 text-xs cursor-pointer"
                onClick={handleClearAll}
              >
                Clear
              </Button>
              <Button
                className="flex-1 text-xs font-semibold cursor-pointer"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
