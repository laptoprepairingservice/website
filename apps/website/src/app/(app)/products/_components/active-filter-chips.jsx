"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ActiveFilterChips - Removable active filter chips bar (to place above product grid)
 */
export function ActiveFilterChips({ categories = [], brands = [], className }) {
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

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStock = searchParams.get("inStock") === "true";
  const sort = searchParams.get("sort");

  const hasAnyFilter =
    currentCategories.length > 0 ||
    currentBrands.length > 0 ||
    minPrice ||
    maxPrice ||
    inStock ||
    (sort && sort !== "relevance");

  if (!hasAnyFilter) return null;

  const removeFilter = (key, valueToRemove = null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (key === "category") {
      const remaining = currentCategories.filter((c) => c !== valueToRemove);
      if (remaining.length > 0) params.set("category", remaining.join(","));
      else params.delete("category");
    } else if (key === "brand") {
      const remaining = currentBrands.filter((b) => b !== valueToRemove);
      if (remaining.length > 0) params.set("brand", remaining.join(","));
      else params.delete("brand");
    } else if (key === "price") {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else if (key === "inStock") {
      params.delete("inStock");
    } else if (key === "sort") {
      params.delete("sort");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    router.push(pathname);
  };

  return (
    <div className={cn("mb-4 flex w-full flex-wrap items-center gap-1.5", className)}>
      <span className="text-muted-foreground mr-1 text-xs font-semibold tracking-wider uppercase">
        Active:
      </span>

      {currentCategories.map((slug) => {
        const cat = categories.find((c) => (c.slug || "").toLowerCase() === slug);
        const name = cat?.name || slug;
        return (
          <button
            key={slug}
            type="button"
            onClick={() => removeFilter("category", slug)}
            className="border-border/70 bg-muted/60 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-foreground flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors"
          >
            <span>{name}</span>
            <X className="size-3" />
          </button>
        );
      })}

      {currentBrands.map((slug) => {
        const b = brands.find((brand) => (brand.slug || "").toLowerCase() === slug);
        const name = b?.name || slug;
        return (
          <button
            key={slug}
            type="button"
            onClick={() => removeFilter("brand", slug)}
            className="border-border/70 bg-muted/60 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-foreground flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors"
          >
            <span>{name}</span>
            <X className="size-3" />
          </button>
        );
      })}

      {(minPrice || maxPrice) && (
        <button
          type="button"
          onClick={() => removeFilter("price")}
          className="border-border/70 bg-muted/60 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-foreground flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors"
        >
          <span>
            {minPrice && maxPrice
              ? `₹${Number(minPrice).toLocaleString("en-IN")} - ₹${Number(maxPrice).toLocaleString("en-IN")}`
              : minPrice
                ? `Above ₹${Number(minPrice).toLocaleString("en-IN")}`
                : `Under ₹${Number(maxPrice).toLocaleString("en-IN")}`}
          </span>
          <X className="size-3" />
        </button>
      )}

      {inStock && (
        <button
          type="button"
          onClick={() => removeFilter("inStock")}
          className="border-border/70 bg-muted/60 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-foreground flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors"
        >
          <span>In Stock Only</span>
          <X className="size-3" />
        </button>
      )}

      <button
        type="button"
        onClick={clearAll}
        className="text-primary ml-2 flex items-center gap-1 text-xs font-semibold hover:underline"
      >
        <RotateCcw className="size-3" />
        Clear All
      </button>
    </div>
  );
}
