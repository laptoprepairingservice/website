"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { FilterFormContent } from "./filter-form-content";
import { cn } from "@/lib/utils";

/**
 * DesktopProductFilters - Strictly desktop sticky sidebar (lg:block only)
 */
export function DesktopProductFilters({
  categories = [],
  brands = [],
  activeCategorySlug = "",
  className,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const hasDirtyChanges = useMemo(() => {
    const brandsMatch =
      stagedBrands.length === currentBrands.length &&
      stagedBrands.every((b) => currentBrands.includes(b));
    return (
      !brandsMatch ||
      stagedMinPrice !== currentMinPrice ||
      stagedMaxPrice !== currentMaxPrice ||
      stagedInStock !== currentInStock ||
      stagedSort !== currentSort
    );
  }, [
    stagedBrands,
    currentBrands,
    stagedMinPrice,
    currentMinPrice,
    stagedMaxPrice,
    currentMaxPrice,
    stagedInStock,
    currentInStock,
    stagedSort,
    currentSort,
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
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  const handleClearAll = () => {
    setStagedBrands([]);
    setStagedMinPrice("");
    setStagedMaxPrice("");
    setStagedInStock(false);
    setStagedSort("relevance");
    router.push(pathname);
  };

  return (
    <aside
      className={cn(
        "border-border bg-card/60 sticky top-24 hidden w-72 shrink-0 rounded-2xl border p-5 shadow-xs backdrop-blur-xs lg:block",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="border-border/70 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-primary size-4" />
          <h2 className="text-foreground text-sm font-bold tracking-tight">Filters</h2>
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
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Accordion Form Content */}
      <div className="py-2">
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
          idPrefix="desktop"
        />
      </div>

      {/* Action Buttons */}
      <div className="border-border/70 mt-4 border-t pt-4 space-y-2">
        <Button
          onClick={handleApply}
          className="w-full text-xs font-semibold cursor-pointer"
          disabled={!hasDirtyChanges}
        >
          Apply Filters
        </Button>
      </div>
    </aside>
  );
}
