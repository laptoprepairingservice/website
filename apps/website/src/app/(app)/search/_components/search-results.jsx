"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpDown,
  ChevronRight,
  Layers,
  PackageSearch,
  RotateCcw,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ui/shadcn/components/breadcrumb";
import { Button } from "@ui/shadcn/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/shadcn/components/select";
import { ProductCard, ProductGrid } from "@/components/store/product-card";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "bestseller", label: "Best Selling" },
];

export function SearchResults({
  query = "",
  currentCategory = "",
  currentSort = "relevance",
  products = [],
  categories = [],
  relatedProducts = [],
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(query);

  const updateSearchUrl = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateSearchUrl({ q: searchInput.trim() });
  };

  const handleCategorySelect = (categorySlug) => {
    // Toggle off if already selected
    const nextCategory = currentCategory === categorySlug ? "" : categorySlug;
    updateSearchUrl({ category: nextCategory });
  };

  const handleSortChange = (newSort) => {
    updateSearchUrl({ sort: newSort === "relevance" ? "" : newSort });
  };

  const handleResetFilters = () => {
    router.push(`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  };

  const hasActiveFilters = Boolean(currentCategory || (currentSort && currentSort !== "relevance"));
  const activeCategoryObj = categories.find((c) => c.slug === currentCategory);

  return (
    <div className="container py-6 sm:py-8 lg:py-10">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/products">Store</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{query ? `Search: "${query}"` : "Search Catalog"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Search & Title Section */}
      <div className="border-border/80 from-card/80 to-background/40 mt-6 rounded-3xl border bg-linear-to-b p-6 shadow-xs backdrop-blur-md sm:p-8">
        <div className="max-w-3xl">
          <div className="text-primary flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <Search className="size-3.5" />
            <span>Product Search Hub</span>
          </div>

          <h1 className="text-foreground mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {query ? (
              <>
                Results for &ldquo;<span className="text-primary">{query}</span>&rdquo;
              </>
            ) : (
              "Explore Hardware & Components"
            )}
          </h1>

          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {products.length} {products.length === 1 ? "component" : "components"} available
            {currentCategory && activeCategoryObj ? ` in ${activeCategoryObj.name}` : ""}
            {query ? ` matching your search query` : ""}.
          </p>

          {/* Quick refinement search bar */}
          <form onSubmit={handleSearchSubmit} className="mt-5 flex max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search processors, GPUs, RAM, SSDs..."
                className="border-input bg-background/90 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20 h-11 w-full rounded-full border pr-9 pl-10 text-sm shadow-xs transition outline-none focus-visible:ring-3"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5"
                  aria-label="Clear search input"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Button type="submit" size="default" className="h-11 shrink-0 rounded-full px-5">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Filter Chips Bar & Sort Controls */}
      <div className="border-border/60 mt-8 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => handleCategorySelect("")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium shadow-2xs transition-all",
              !currentCategory
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/70 hover:bg-accent text-muted-foreground hover:text-foreground border-border/60 border"
            )}
          >
            All Categories ({categories.reduce((acc, c) => acc + (c.count || 0), 0)})
          </button>

          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium shadow-2xs transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/70 hover:bg-accent text-muted-foreground hover:text-foreground border-border/60 border"
                )}
              >
                <span>{cat.name}</span>
                {cat.count > 0 && (
                  <span
                    className={cn(
                      "py-0.2 rounded-full px-1.5 text-[10px]",
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background/80 text-muted-foreground"
                    )}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-muted-foreground hover:text-foreground ml-2 flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline"
            >
              <RotateCcw className="size-3" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex shrink-0 items-center gap-2">
          <ArrowUpDown className="text-muted-foreground size-4" />
          <span className="text-muted-foreground text-xs font-medium whitespace-nowrap">
            Sort by:
          </span>
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="border-border h-9 w-[180px] rounded-lg text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent align="end">
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Search Results Grid */}
      {products.length > 0 ? (
        <div className="mt-8">
          <ProductGrid products={products} columns={4} />
        </div>
      ) : (
        /* Empty State */
        <div className="border-border/80 bg-muted/20 mt-8 rounded-3xl border border-dashed p-8 text-center sm:p-12">
          <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-2xl">
            <PackageSearch className="size-7" />
          </div>

          <h2 className="text-foreground mt-4 text-xl font-bold">
            No components found {query ? `for "${query}"` : ""}
          </h2>

          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            {currentCategory
              ? `We couldn't find any products in this category. Try clearing your category filter or modifying your search.`
              : `We couldn't find any products matching your query. Try checking your spelling or using broader keywords like "Intel", "GPU", "SSD", or "RAM".`}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleResetFilters} className="rounded-full">
                <RotateCcw className="mr-1.5 size-4" />
                Clear Filters
              </Button>
            )}
            <Button asChild className="rounded-full">
              <Link href="/products">Browse All Catalog</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Related Data Section 1: "Related Hardware You May Like" */}
      {relatedProducts.length > 0 && (
        <section className="border-border/70 mt-16 border-t pt-10 sm:mt-20 sm:pt-14">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-primary flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="size-3.5" />
                <span>Recommended Picks</span>
              </div>
              <h2 className="text-foreground mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                Related Hardware You May Like
              </h2>
              <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                Top-rated components and popular hardware in high demand
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-primary hover:text-primary/80 self-start sm:self-auto"
            >
              <Link href="/products" className="flex items-center gap-1">
                View catalog <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>

          <ProductGrid products={relatedProducts} columns={4} />
        </section>
      )}

      {/* Related Data Section 2: "Explore by Category" */}
      {categories.length > 0 && (
        <section className="border-border/70 mt-16 border-t pt-10 sm:mt-20 sm:pt-14">
          <div className="mb-6">
            <div className="text-primary flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
              <Layers className="size-3.5" />
              <span>Explore Categories</span>
            </div>
            <h2 className="text-foreground mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              Shop by Hardware Category
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
              Browse components specifically organized for building, upgrading, or repairing PCs
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.id || cat.slug}
                href={`/products?category=${encodeURIComponent(cat.slug)}`}
                className="group border-border/70 bg-card/60 hover:border-primary/50 hover:bg-card relative flex flex-col items-center rounded-2xl border p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="bg-muted/80 relative mb-3 flex size-14 items-center justify-center overflow-hidden rounded-xl p-2 transition-transform duration-200 group-hover:scale-105 sm:size-16">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="64px"
                      className="object-contain p-1.5"
                    />
                  ) : (
                    <Tag className="text-muted-foreground size-6" />
                  )}
                </div>

                <span className="text-foreground group-hover:text-primary line-clamp-1 text-xs font-semibold transition-colors sm:text-sm">
                  {cat.name}
                </span>

                <span className="text-muted-foreground mt-0.5 text-[11px]">
                  {cat.count} {cat.count === 1 ? "product" : "products"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
