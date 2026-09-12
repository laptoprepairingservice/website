"use client";

import Link from "next/link";
import { Grid, Search, Tag } from "lucide-react";
import { Breadcrumb } from "@ui/shadcn/components/breadcrumb";
import { Input } from "@ui/shadcn/components/input";
import { EmptyState } from "@ui/shadcn/components/empty-state";
import { ProductGrid } from "@/components/store/product-card";
import { Button } from "@ui/shadcn/components/button";

export function SearchResults({ query = "", products = [], categories = [] }) {
  return (
    <div className="py-8 lg:py-12">
      <Breadcrumb items={[{ label: "Search Results" }]} />

      <div className="mt-6">
        <form action="/search" className="relative max-w-2xl">
          <Search className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search products..."
            className="h-12 pl-12 text-base"
          />
        </form>
      </div>

      {!query && categories.length > 0 && (
        <div className="mt-10">
          <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
            <Tag className="size-4" />
            Explore Categories
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id || cat.slug}
                href={`/products?category=${encodeURIComponent(cat.slug)}`}
                className="border-border hover:bg-accent hover:text-foreground text-muted-foreground rounded-full border px-4 py-2 text-sm transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {query && products.length > 0 && (
        <div className="mt-12">
          <p className="text-muted-foreground mb-8">
            {products.length} {products.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
          </p>
          <ProductGrid products={products} />
        </div>
      )}

      {query && products.length === 0 && (
        <EmptyState
          icon={Search}
          title="No products found"
          description={`We couldn't find any products matching "${query}". Try different keywords or browse our catalog.`}
          action={
            <Button asChild>
              <Link href="/products">Browse All Products</Link>
            </Button>
          }
          className="mt-12"
        />
      )}
    </div>
  );
}
