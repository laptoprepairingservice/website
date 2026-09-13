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
export function MobileFilterHeader({ categories = [], brands = [], className }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sheetOpen, setSheetOpen] = useState(false);

  const currentCategories = useMemo(() => {
    const raw = searchParams.get("category");
    return raw
      ? raw
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      : [];
  }, [searchParams]);

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

  const [stagedCategories, setStagedCategories] = useState(currentCategories);
  const [stagedBrands, setStagedBrands] = useState(currentBrands);
  const [stagedMinPrice, setStagedMinPrice] = useState(currentMinPrice);
  const [stagedMaxPrice, setStagedMaxPrice] = useState(currentMaxPrice);
  const [stagedInStock, setStagedInStock] = useState(currentInStock);
  const [stagedSort, setStagedSort] = useState(currentSort);

  useEffect(() => {
    setStagedCategories(currentCategories);
    setStagedBrands(currentBrands);
    setStagedMinPrice(currentMinPrice);
    setStagedMaxPrice(currentMaxPrice);
    setStagedInStock(currentInStock);
    setStagedSort(currentSort);
  }, [
    currentCategories,
    currentBrands,
    currentMinPrice,
    currentMaxPrice,
    currentInStock,
    currentSort,
    sheetOpen,
  ]);

  const activeFilterCount =
    currentCategories.length +
    currentBrands.length +
    (currentMinPrice || currentMaxPrice ? 1 : 0) +
    (currentInStock ? 1 : 0) +
    (currentSort !== "relevance" ? 1 : 0);

  const stagedFilterCount =
    stagedCategories.length +
    stagedBrands.length +
    (stagedMinPrice || stagedMaxPrice ? 1 : 0) +
    (stagedInStock ? 1 : 0) +
    (stagedSort !== "relevance" ? 1 : 0);

  const pushFiltersToUrl = (filters) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (filters.category && filters.category.length > 0) {
      params.set("category", filters.category.join(","));
    } else {
      params.delete("category");
    }

    if (filters.brand && filters.brand.length > 0) {
      params.set("brand", filters.brand.join(","));
    } else {
      params.delete("brand");
    }

    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    else params.delete("minPrice");

    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    else params.delete("maxPrice");

    if (filters.inStock) params.set("inStock", "true");
    else params.delete("inStock");

    if (filters.sort && filters.sort !== "relevance") params.set("sort", filters.sort);
    else params.delete("sort");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleApply = () => {
    pushFiltersToUrl({
      category: stagedCategories,
      brand: stagedBrands,
      minPrice: stagedMinPrice,
      maxPrice: stagedMaxPrice,
      inStock: stagedInStock,
      sort: stagedSort,
    });
    setSheetOpen(false);
  };

  const handleClearAll = () => {
    setStagedCategories([]);
    setStagedBrands([]);
    setStagedMinPrice("");
    setStagedMaxPrice("");
    setStagedInStock(false);
    setStagedSort("relevance");
    router.push(pathname);
    setSheetOpen(false);
  };

  return (
    <div className={cn("flex shrink-0 items-center gap-1.5 lg:hidden", className)}>
      {/* Tiny Filter Button in Header */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSheetOpen(true)}
        className="border-border/80 h-8 gap-1.5 rounded-full px-2.5 text-xs font-semibold shadow-2xs"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="text-primary size-3.5" />
        <span>Filter</span>
        {activeFilterCount > 0 && (
          <span className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full text-[10px] font-bold">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {/* Mobile Slide-Out Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          {/* Header */}
          <SheetHeader className="border-border/80 border-b p-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-foreground flex items-center gap-2 text-base font-bold">
                <SlidersHorizontal className="text-primary size-4" />
                <span>Filters & Sort</span>
                {stagedFilterCount > 0 && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                    {stagedFilterCount}
                  </Badge>
                )}
              </SheetTitle>

              {stagedFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-muted-foreground hover:text-foreground text-xs font-medium underline underline-offset-4"
                >
                  Reset All
                </button>
              )}
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            <FilterFormContent
              categories={categories}
              brands={brands}
              stagedCategories={stagedCategories}
              setStagedCategories={setStagedCategories}
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
              idPrefix="mob"
            />
          </div>

          {/* Sticky Footer */}
          <SheetFooter className="border-border/80 bg-card/95 border-t p-4 backdrop-blur-md">
            <div className="flex w-full items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearAll}
                className="flex-1 rounded-xl text-xs font-semibold"
              >
                Clear All
              </Button>
              <Button
                type="button"
                onClick={handleApply}
                className="flex-1 rounded-xl text-xs font-bold"
              >
                Apply {stagedFilterCount > 0 ? `(${stagedFilterCount})` : ""}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
