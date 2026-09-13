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
export function DesktopProductFilters({ categories = [], brands = [], className }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

    if (filters.category && filters.category.length > 0)
      params.set("category", filters.category.join(","));
    else params.delete("category");

    if (filters.brand && filters.brand.length > 0) params.set("brand", filters.brand.join(","));
    else params.delete("brand");

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
  };

  const handleClearAll = () => {
    setStagedCategories([]);
    setStagedBrands([]);
    setStagedMinPrice("");
    setStagedMaxPrice("");
    setStagedInStock(false);
    setStagedSort("relevance");
    router.push(pathname);
  };

  return (
    <aside className={cn("hidden w-64 shrink-0 lg:block", className)}>
      <div className="border-border bg-card sticky top-28 rounded-2xl border p-4 shadow-xs">
        <div className="border-border/80 mb-3 flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="text-primary size-4" />
            <h2 className="text-foreground text-sm font-semibold tracking-wider uppercase">
              Filters
            </h2>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-xs font-semibold">
                {activeFilterCount}
              </Badge>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium transition-colors"
            >
              <RotateCcw className="size-3" />
              Clear
            </button>
          )}
        </div>

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
          idPrefix="desk"
        />

        <div className="border-border/80 mt-4 flex items-center gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={handleClearAll} className="flex-1 text-xs">
            Clear All
          </Button>
          <Button size="sm" onClick={handleApply} className="flex-1 text-xs font-semibold">
            Apply {stagedFilterCount > 0 ? `(${stagedFilterCount})` : ""}
          </Button>
        </div>
      </div>
    </aside>
  );
}
