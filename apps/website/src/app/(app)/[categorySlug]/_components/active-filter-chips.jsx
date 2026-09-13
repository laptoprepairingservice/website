"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { Badge } from "@ui/shadcn/components/badge";
import { SORT_OPTIONS } from "./filter-constants";
import { formatPrice } from "@/lib/format";

/**
 * ActiveFilterChips - Displays active filter chips for brand, price, inStock, sort
 */
export function ActiveFilterChips({ brands = [], activeCategorySlug = "", className }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const brandParam = searchParams.get("brand");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStock = searchParams.get("inStock");
  const sort = searchParams.get("sort");

  const chips = useMemo(() => {
    const list = [];

    // Brands chips
    if (brandParam) {
      const slugs = brandParam.split(",").map((s) => s.trim().toLowerCase());
      slugs.forEach((slug) => {
        const brandObj = brands.find((b) => (b.slug || "").toLowerCase() === slug);
        list.push({
          type: "brand",
          value: slug,
          label: brandObj ? brandObj.name : slug,
        });
      });
    }

    // Price range chip
    if (minPrice || maxPrice) {
      let priceLabel = "";
      if (minPrice && maxPrice) {
        priceLabel = `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
      } else if (minPrice) {
        priceLabel = `Above ${formatPrice(minPrice)}`;
      } else {
        priceLabel = `Under ${formatPrice(maxPrice)}`;
      }
      list.push({
        type: "price",
        value: "price",
        label: priceLabel,
      });
    }

    // In Stock chip
    if (inStock === "true") {
      list.push({
        type: "inStock",
        value: "true",
        label: "In Stock Only",
      });
    }

    // Sort chip
    if (sort && sort !== "relevance") {
      const match = SORT_OPTIONS.find((o) => o.value === sort);
      list.push({
        type: "sort",
        value: sort,
        label: `Sort: ${match ? match.label : sort}`,
      });
    }

    return list;
  }, [brandParam, minPrice, maxPrice, inStock, sort, brands]);

  if (chips.length === 0) return null;

  const removeChip = (chip) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (chip.type === "brand") {
      const current = (params.get("brand") || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const remaining = current.filter((b) => b !== chip.value);
      if (remaining.length > 0) params.set("brand", remaining.join(","));
      else params.delete("brand");
    } else if (chip.type === "price") {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else if (chip.type === "inStock") {
      params.delete("inStock");
    } else if (chip.type === "sort") {
      params.delete("sort");
    }

    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-1.5 pt-1">
      <span className="text-muted-foreground mr-1 text-xs">Active filters:</span>
      {chips.map((chip) => (
        <Badge
          key={`${chip.type}-${chip.value}`}
          variant="secondary"
          className="bg-muted hover:bg-muted/80 text-foreground flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-normal transition-colors"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => removeChip(chip)}
            className="hover:bg-foreground/10 ml-0.5 rounded-full p-0.5 transition cursor-pointer"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}

      <button
        type="button"
        onClick={clearAllFilters}
        className="text-primary hover:text-primary/80 ml-2 text-xs font-semibold hover:underline cursor-pointer"
      >
        Clear all
      </button>
    </div>
  );
}
