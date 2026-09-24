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
 * Client-side product grid for Brand and Brand+Category pages.
 * Uses the shared List wrapper for Supabase querying and pagination.
 */
export function CategoryProducts({
  brandId,
  brandSlug = "",
  brandName = "",
  categoryId,
  categorySlug = "",
  categoryName = "",
  minPrice = "",
  maxPrice = "",
  inStock = "",
  sort = "relevance",
}) {
  // Construct dynamic filters for the List component
  const listFilters = {
    status: "active",
    ...(brandId ? { brand_id: brandId } : {}),
    ...(categoryId ? { category_id: categoryId } : {}),
  };

  const metaFilters = {
    status: { column: "status", operator: "eq" },
    ...(brandId ? { brand_id: { column: "brand_id", operator: "eq" } } : {}),
    ...(categoryId ? { category_id: { column: "category_id", operator: "eq" } } : {}),
  };

  const clearHref = categorySlug ? `/${brandSlug}/${categorySlug}` : `/${brandSlug}`;
  const pageTitle = categoryName
    ? `${brandName} ${categoryName}`.trim()
    : brandName || "Products";

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
      filters={listFilters}
      meta={{
        select: PRODUCT_CATEGORY_SELECT,
        filters: metaFilters,
      }}
      shimmer={<ProductGridSkeleton />}
    >
      {({ items }) => {
        // Map raw rows → normalised product objects
        let products = items.map(mapSupabaseProduct).filter(Boolean);

        // Fallback filter by brandSlug if brandId was not provided
        if (brandSlug && !brandId) {
          products = products.filter((p) => {
            const bSlug = (p.brandSlug || "").toLowerCase();
            return bSlug === brandSlug.toLowerCase();
          });
        }

        // Fallback filter by categorySlug if categoryId was not provided
        if (categorySlug && !categoryId) {
          products = products.filter((p) => {
            const cSlug = (p.category || "").toLowerCase();
            return cSlug === categorySlug.toLowerCase();
          });
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
          // already ordered by created_at desc from server
        }

        if (products.length === 0) {
          return (
            <div className="border-border bg-card/40 rounded-2xl border border-dashed px-6 py-16 text-center">
              <div className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-2xl">
                <span className="text-xl font-bold">✕</span>
              </div>
              <h2 className="text-foreground mt-4 text-lg font-bold">
                No products match the selected filters in {pageTitle}
              </h2>
              <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs sm:text-sm">
                Try widening your price range, clearing filters, or checking availability.
              </p>
              <div className="mt-5">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={clearHref}>Clear Filters</Link>
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
