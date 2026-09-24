"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

import { Badge } from "@ui/shadcn/components/badge";
import { FilterFormContent } from "./filter-form-content";
import { cn } from "@/lib/utils";

/**
 * DesktopProductFilters - Strictly desktop sticky sidebar (lg:block only)
 * Auto-updates immediately on filter changes without an Apply button.
 */
export function DesktopProductFilters({
  categories = [],
  brands = [],
  activeBrandSlug = "",
  activeCategorySlug = "",
  className,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") === "true";
  const sort = searchParams.get("sort") || "relevance";

  // Local state for debounced Min/Max price inputs
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);

  // Synchronize inputs when URL changes from outside (e.g. preset or chip removal)
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

  // Count active query filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeCategorySlug) count += 1;
    if (minPriceParam || maxPriceParam) count += 1;
    if (inStock) count += 1;
    if (sort && sort !== "relevance") count += 1;
    return count;
  }, [activeCategorySlug, minPriceParam, maxPriceParam, inStock, sort]);

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
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Direct Auto-Updating Form Content */}
      <div className="py-2">
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
          idPrefix="desktop"
        />
      </div>
    </aside>
  );
}
