"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Select } from "@/components/ui/form-controls";
import { Drawer } from "@/components/ui/modal";
import { BRANDS, CATEGORIES } from "@/lib/data/products";
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

function FilterContent({ className }) {
  return (
    <div className={cn("space-y-0", className)}>
      <FilterSection title="Category">
        {CATEGORIES.map((cat) => (
          <Checkbox key={cat.id} id={`cat-${cat.id}`} label={`${cat.name} (${cat.count})`} />
        ))}
      </FilterSection>

      <FilterSection title="Brand">
        {BRANDS.map((brand) => (
          <Checkbox key={brand.id} id={`brand-${brand.id}`} label={brand.name} />
        ))}
      </FilterSection>

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

export function ProductFilters({ className }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <aside className={cn("hidden w-64 shrink-0 lg:block", className)}>
        <div className="sticky top-28 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Filters</h2>
          <FilterContent />
        </div>
      </aside>

      <div className="lg:hidden">
        <Button variant="outline" onClick={() => setDrawerOpen(true)} className="w-full">
          <SlidersHorizontal />
          Filters & Sort
        </Button>
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Filters & Sort">
          <FilterContent />
        </Drawer>
      </div>
    </>
  );
}
