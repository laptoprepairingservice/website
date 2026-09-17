"use client";

import List from "@/components/react-list";
import { ProductCard } from "@/components/store/product-card";
import { ShimmerEffect } from "@/components/shimmer";
import { mapSupabaseProduct } from "@/lib/store/products/mapper";
import { PRODUCT_CATEGORY_SELECT } from "@/lib/store/products/select";
import { Button } from "@ui/shadcn/components/button";
import Link from "next/link";

/**
 * Skeleton shimmer grid shown while products are loading.
 */
function ProductGridSkeleton({ columns = 12 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="bg-card overflow-hidden rounded-2xl border">
          <ShimmerEffect className="aspect-square w-full" />
          <div className="space-y-3 p-4">
            <ShimmerEffect className="h-3 w-1/2 rounded" />
            <ShimmerEffect className="h-4 w-full rounded" />
            <ShimmerEffect className="h-4 w-3/4 rounded" />
            <div className="flex items-center justify-between pt-2">
              <ShimmerEffect className="h-6 w-20 rounded" />
              <ShimmerEffect className="h-9 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Client-side product grid for a category page.
 * Uses the shared List wrapper (which wraps @7span/react-list) for data fetching
 * and pagination. URL-based filters (brand, price, inStock, sort) are applied
 * client-side in the children render prop — matching the existing behaviour.
 *
 * @param {{
 *   categoryId: number,
 *   categorySlug: string,
 *   categoryName: string,
 *   brand: string,
 *   minPrice: string,
 *   maxPrice: string,
 *   inStock: string,
 *   sort: string,
 * }} props
 */
export function CategoryProducts({
  categoryId,
  categorySlug,
  categoryName,
  brand = "",
  minPrice = "",
  maxPrice = "",
  inStock = "",
  sort = "relevance",
}) {
  return (
    <List
      endpoint="products"
      perPage={200}
      sortBy="created_at"
      sortOrder="desc"
      showHeader={false}
      showListHeader={false}
      showSearch={false}
      hidePagination={false}
      filters={{
        status: "active",
        category_id: categoryId,
      }}
      meta={{
        select: PRODUCT_CATEGORY_SELECT,
        filters: {
          status: { column: "status", operator: "eq" },
          category_id: { column: "category_id", operator: "eq" },
        },
      }}
      shimmer={<ProductGridSkeleton />}
    >
      {({ items }) => {
        // Map raw rows → normalised product objects
        let products = items.map(mapSupabaseProduct).filter(Boolean);

        // Client-side brand filter
        if (brand) {
          const brandList = brand
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
          if (brandList.length > 0) {
            products = products.filter((p) => {
              const bSlug = (p.brandSlug || "").toLowerCase();
              const bName = (p.brand || "").toLowerCase();
              return brandList.some((b) => b === bSlug || b === bName);
            });
          }
        }

        // Client-side price range filter
        if (minPrice && !isNaN(Number(minPrice))) {
          products = products.filter((p) => (p.price ?? 0) >= Number(minPrice));
        }
        if (maxPrice && !isNaN(Number(maxPrice))) {
          products = products.filter((p) => (p.price ?? 0) <= Number(maxPrice));
        }

        // Client-side in-stock filter
        if (inStock === "true") {
          products = products.filter((p) => p.inStock);
        }

        // Client-side sort
        if (sort === "price-asc") {
          products = [...products].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        } else if (sort === "price-desc") {
          products = [...products].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        } else if (sort === "bestseller") {
          products = [...products].sort(
            (a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)
          );
        } else if (sort === "newest") {
          // already ordered by created_at desc from the server
        }

        if (products.length === 0) {
          return (
            <div className="border-border bg-card/40 rounded-2xl border border-dashed px-6 py-16 text-center">
              <div className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-2xl">
                <span className="text-xl font-bold">✕</span>
              </div>
              <h2 className="text-foreground mt-4 text-lg font-bold">
                No products match the selected filters in {categoryName}
              </h2>
              <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs sm:text-sm">
                Try widening your price range, clearing brand filters, or checking availability.
              </p>
              <div className="mt-5">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/${categorySlug}`}>Clear Filters</Link>
                </Button>
              </div>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        );
      }}
    </List>
  );
}
