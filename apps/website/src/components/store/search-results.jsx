"use client";

import Link from "next/link";
import { Clock, Search, TrendingUp } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductGrid } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { POPULAR_SEARCHES, PRODUCTS, RECENT_SEARCHES } from "@/lib/data/products";

export function SearchResults({ query = "" }) {
  const results = query
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="container-store py-8 lg:py-12">
      <Breadcrumb items={[{ label: "Search Results" }]} />

      <div className="mt-6">
        <form action="/search" className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search processors, GPUs, RAM, SSDs..."
            className="h-12 pl-12 text-base"
          />
        </form>
      </div>

      {!query && (
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="size-4" />
              Recent Searches
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {RECENT_SEARCHES.map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="size-4" />
              Popular Searches
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {query && results.length > 0 && (
        <div className="mt-12">
          <p className="mb-8 text-muted-foreground">
            {results.length} results for &ldquo;{query}&rdquo;
          </p>
          <ProductGrid products={results} />
        </div>
      )}

      {query && results.length === 0 && (
        <EmptyState
          icon={Search}
          title="No results found"
          description={`We couldn't find any products matching "${query}". Try different keywords or browse our categories.`}
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
