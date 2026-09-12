"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { Checkbox, Select } from "@ui/shadcn/components/form-controls";
import { Drawer } from "@ui/shadcn/components/modal";
import { cn } from "@/lib/utils";

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-4 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-medium"
        aria-expanded={open}
      >
        {title}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-4 space-y-3">{children}</div>}
    </div>
  );
}

function FilterContent({ categories = [], brands = [], className }) {
  return (
    <div className={cn("space-y-0", className)}>
      {categories.length > 0 && (
        <FilterSection title="Category">
          {categories.map((cat) => (
            <Checkbox key={cat.id || cat.slug} id={`cat-${cat.id || cat.slug}`} label={`${cat.name}${cat.count ? ` (${cat.count})` : ""}`} />
          ))}
        </FilterSection>
      )}

      {brands.length > 0 && (
        <FilterSection title="Brand">
          {brands.map((brand) => (
            <Checkbox key={brand.id || brand.slug} id={`brand-${brand.id || brand.slug}`} label={brand.name} />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Price Range">
        <div className="space-y-3">
          <input type="range" min="1000" max="200000" step="1000" defaultValue="50000" className="w-full accent-primary" aria-label="Price range" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹1,000</span>
            <span>₹2,00,000</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <Checkbox id="in-stock" label="In Stock" defaultChecked />
        <Checkbox id="out-of-stock" label="Out of Stock" />
      </FilterSection>

      <FilterSection title="Rating">
        {[4, 3, 2, 1].map((rating) => (
          <Checkbox key={rating} id={`rating-${rating}`} label={`${rating}★ & above`} />
        ))}
      </FilterSection>

      <FilterSection title="Sort By">
        <Select
          options={[
            { value: "popular", label: "Most Popular" },
            { value: "price-asc", label: "Price: Low to High" },
            { value: "price-desc", label: "Price: High to Low" },
            { value: "newest", label: "Newest First" },
            { value: "rating", label: "Highest Rated" },
          ]}
          defaultValue="popular"
        />
      </FilterSection>
    </div>
  );
}

export function ProductFilters({ categories = [], brands = [], className }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <aside className={cn("hidden w-64 shrink-0 lg:block", className)}>
        <div className="sticky top-28 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Filters</h2>
          <FilterContent categories={categories} brands={brands} />
        </div>
      </aside>

      <div className="lg:hidden">
        <Button variant="outline" onClick={() => setDrawerOpen(true)} className="w-full">
          <SlidersHorizontal />
          Filters & Sort
        </Button>
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Filters & Sort">
          <FilterContent categories={categories} brands={brands} />
        </Drawer>
      </div>
    </>
  );
}
