"use client";

import Link from "next/link";
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
 * FilterFormContent - Reusable form sections for both Desktop Sidebar and Mobile Sheet
 * Category section renders direct links to other category pages per user specifications.
 */
export function FilterFormContent({
  categories = [],
  brands = [],
  activeCategorySlug = "",
  stagedBrands,
  setStagedBrands,
  stagedMinPrice,
  setStagedMinPrice,
  stagedMaxPrice,
  setStagedMaxPrice,
  stagedInStock,
  setStagedInStock,
  stagedSort,
  setStagedSort,
  idPrefix = "f",
  onNavigate,
}) {
  const toggleBrand = (slug) => {
    const lower = slug.toLowerCase();
    setStagedBrands((prev) =>
      prev.includes(lower) ? prev.filter((b) => b !== lower) : [...prev, lower]
    );
  };

  const handlePresetPrice = (min, max) => {
    if (stagedMinPrice === min && stagedMaxPrice === max) {
      setStagedMinPrice("");
      setStagedMaxPrice("");
    } else {
      setStagedMinPrice(min);
      setStagedMaxPrice(max);
    }
  };

  return (
    <div className="space-y-0.5">
      {/* 1. Sort By Section */}
      <FilterAccordion title="Sort By" defaultOpen={true}>
        <Select value={stagedSort} onValueChange={setStagedSort}>
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

      {/* 2. Categories Section: Interactive direct links without checkboxes */}
      {categories.length > 0 && (
        <FilterAccordion title="Categories" defaultOpen={true}>
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const slug = (cat.slug || "").toLowerCase();
              const isCurrent = (activeCategorySlug || "").toLowerCase() === slug;
              return (
                <Link
                  key={cat.id || cat.slug}
                  href={`/${cat.slug}`}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                    isCurrent
                      ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat.count > 0 && (
                    <span className="text-[11px] opacity-70">({cat.count})</span>
                  )}
                </Link>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      {/* 3. Brands Section */}
      {brands.length > 0 && (
        <FilterAccordion
          title="Brands"
          defaultOpen={true}
          badge={stagedBrands.length > 0 ? stagedBrands.length : null}
        >
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {brands.map((brand) => {
              const slug = (brand.slug || "").toLowerCase();
              const isChecked = stagedBrands.includes(slug);
              return (
                <div key={brand.id || brand.slug} className="flex items-center justify-between">
                  <Checkbox
                    id={`${idPrefix}-brand-${brand.id || brand.slug}`}
                    label={brand.name}
                    checked={isChecked}
                    onChange={() => toggleBrand(slug)}
                  />
                </div>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      {/* 4. Price Range Section */}
      <FilterAccordion
        title="Price Range"
        defaultOpen={true}
        badge={stagedMinPrice || stagedMaxPrice ? "Active" : null}
      >
        <div className="space-y-2.5">
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {PRICE_PRESETS.map((p) => {
              const isSelected = stagedMinPrice === p.min && stagedMaxPrice === p.max;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handlePresetPrice(p.min, p.max)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
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

          {/* Custom Min / Max Inputs */}
          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <span className="text-muted-foreground absolute top-1/2 left-2 -translate-y-1/2 text-xs">
                ₹
              </span>
              <input
                type="number"
                placeholder="Min"
                value={stagedMinPrice}
                onChange={(e) => setStagedMinPrice(e.target.value)}
                className="border-border bg-background text-foreground h-8 w-full rounded-md border pr-2 pl-5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
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
                value={stagedMaxPrice}
                onChange={(e) => setStagedMaxPrice(e.target.value)}
                className="border-border bg-background text-foreground h-8 w-full rounded-md border pr-2 pl-5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
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
          checked={stagedInStock}
          onChange={(checked) => setStagedInStock(Boolean(checked))}
        />
      </FilterAccordion>
    </div>
  );
}
