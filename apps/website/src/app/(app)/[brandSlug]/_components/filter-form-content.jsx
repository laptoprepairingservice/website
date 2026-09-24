"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Checkbox } from "@ui/shadcn/components/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/shadcn/components/select";
import { FilterAccordion } from "./filter-accordion";
import { PRICE_PRESETS, SORT_OPTIONS } from "./filter-constants";
import { cn } from "@/lib/utils";

/**
 * FilterFormContent - Reusable auto-updating form sections for Desktop Sidebar and Mobile Sheet
 */
export function FilterFormContent({
  categories = [],
  brands = [],
  activeBrandSlug = "",
  activeCategorySlug = "",
  minPriceInput = "",
  setMinPriceInput = () => {},
  maxPriceInput = "",
  setMaxPriceInput = () => {},
  inStock = false,
  sort = "relevance",
  onFilterChange = () => {},
  onPresetPrice = () => {},
  idPrefix = "f",
  onNavigate,
}) {
  const searchParams = useSearchParams();

  // Helper to preserve active non-category filters on brand / category navigation
  const getPreservedQuery = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const currentQs = getPreservedQuery();

  return (
    <div className="space-y-0.5">
      {/* 1. Sort By Section */}
      <FilterAccordion title="Sort By" defaultOpen={true}>
        <Select
          value={sort || "relevance"}
          onValueChange={(val) => onFilterChange({ sort: val })}
        >
          <SelectTrigger className="w-full text-xs">
            <SelectValue placeholder="Sort products" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterAccordion>

      {/* 2. Brands Section */}
      {brands.length > 0 && (
        <FilterAccordion
          title="Brands"
          defaultOpen={true}
          badge={activeBrandSlug ? "1" : null}
        >
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {brands.map((brand) => {
              const bSlug = (brand.slug || "").toLowerCase();
              const isCurrent = (activeBrandSlug || "").toLowerCase() === bSlug;
              const href = `/${brand.slug}${currentQs}`;

              return (
                <Link
                  key={brand.id || brand.slug}
                  href={href}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                    isCurrent
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <span className="truncate">{brand.name}</span>
                  {isCurrent && (
                    <span className="bg-primary size-1.5 rounded-full shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      {/* 3. Categories Section */}
      {categories.length > 0 && (
        <FilterAccordion
          title="Categories"
          defaultOpen={true}
          badge={activeCategorySlug ? "1" : null}
        >
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const cSlug = (cat.slug || "").toLowerCase();
              const isCurrent = (activeCategorySlug || "").toLowerCase() === cSlug;

              // If clicked on current active category, toggle off and go to /brandSlug
              // Otherwise, go to /brandSlug/categorySlug
              const href = isCurrent
                ? `/${activeBrandSlug}${currentQs}`
                : `/${activeBrandSlug}/${cat.slug}${currentQs}`;

              return (
                <Link
                  key={cat.id || cat.slug}
                  href={href}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                    isCurrent
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <span className="truncate">{cat.name}</span>
                  <div className="flex items-center gap-1.5">
                    {cat.count > 0 && (
                      <span className="text-[11px] opacity-70">({cat.count})</span>
                    )}
                    {isCurrent && (
                      <span className="bg-primary size-1.5 rounded-full shrink-0" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      {/* 4. Price Range Section */}
      <FilterAccordion
        title="Price Range"
        defaultOpen={true}
        badge={minPriceInput || maxPriceInput ? "Active" : null}
      >
        <div className="space-y-2.5">
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {PRICE_PRESETS.map((p) => {
              const isSelected =
                String(minPriceInput || "") === String(p.min) &&
                String(maxPriceInput || "") === String(p.max);

              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => onPresetPrice(p.min, p.max)}
                  className={cn(
                    "cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/80 bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Custom Min / Max Inputs with ~400ms debounce */}
          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <span className="text-muted-foreground absolute top-1/2 left-2 -translate-y-1/2 text-xs">
                ₹
              </span>
              <input
                type="number"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="border-border bg-background text-foreground focus:ring-primary h-8 w-full rounded-md border pr-2 pl-5 text-xs focus:ring-1 focus:outline-none"
              />
            </div>
            <span className="text-muted-foreground text-xs">–</span>
            <div className="relative flex-1">
              <span className="text-muted-foreground absolute top-1/2 left-2 -translate-y-1/2 text-xs">
                ₹
              </span>
              <input
                type="number"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="border-border bg-background text-foreground focus:ring-primary h-8 w-full rounded-md border pr-2 pl-5 text-xs focus:ring-1 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </FilterAccordion>

      {/* 5. Availability Section */}
      <FilterAccordion title="Availability" defaultOpen={true}>
        <Checkbox
          id={`${idPrefix}-in-stock`}
          label="In Stock Only"
          checked={inStock}
          onChange={(checked) => onFilterChange({ inStock: checked ? "true" : "" })}
        />
      </FilterAccordion>
    </div>
  );
}
