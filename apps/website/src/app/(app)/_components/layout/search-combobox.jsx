"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Package, Search, Tag, TrendingUp, X } from "lucide-react";

import { liveSearchAction } from "@/app/(app)/_actions/search-actions";
import { formatDiscount, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const TRENDING_SEARCHES = ["HP Laptop Battery", "Dell Laptop Battery", "Motherboard", "Charger"];

const POPULAR_CATEGORIES = [
  { name: "Processors", slug: "processors" },
  { name: "Graphics Cards", slug: "graphics-cards" },
  { name: "Memory (RAM)", slug: "ram" },
  { name: "Storage SSD", slug: "ssd" },
];

export function SearchCombobox({ className }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState({ products: [], categories: [], totalCount: 0 });
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ products: [], categories: [], totalCount: 0 });
      setSelectedIndex(-1);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      startTransition(async () => {
        const data = await liveSearchAction(trimmed);
        setResults(data || { products: [], categories: [], totalCount: 0 });
        setSelectedIndex(-1);
      });
    }, 200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Flatten actionable items for keyboard navigation
  // Items order: categories first, then products, then "view all"
  const actionableItems = [];
  if (query.trim()) {
    results.categories.forEach((cat) => {
      actionableItems.push({
        type: "category",
        label: cat.name,
        href: `/search?q=${encodeURIComponent(query.trim())}&category=${encodeURIComponent(cat.slug)}`,
      });
    });
    results.products.forEach((prod) => {
      actionableItems.push({
        type: "product",
        label: prod.name,
        href: `/products/${prod.slug}`,
      });
    });
    if (query.trim()) {
      actionableItems.push({
        type: "view_all",
        label: `View all results for "${query.trim()}"`,
        href: `/search?q=${encodeURIComponent(query.trim())}`,
      });
    }
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < actionableItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : actionableItems.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && actionableItems[selectedIndex]) {
        e.preventDefault();
        setIsOpen(false);
        router.push(actionableItems[selectedIndex].href);
      } else if (query.trim()) {
        e.preventDefault();
        setIsOpen(false);
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults({ products: [], categories: [], totalCount: 0 });
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSelectTrending = (term) => {
    setQuery(term);
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const hasQuery = Boolean(query.trim());
  const hasProducts = results.products.length > 0;
  const hasCategories = results.categories.length > 0;
  const noMatches = hasQuery && !isPending && !hasProducts && !hasCategories;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="text-muted-foreground pointer-events-none absolute left-3.5 size-4" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search processors, GPUs, RAM, SSDs..."
            aria-label="Search products"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            role="combobox"
            autoComplete="off"
            className="border-input bg-background/80 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20 h-10 w-full rounded-full border pr-10 pl-10 text-sm shadow-xs transition-all duration-200 outline-none focus-visible:ring-3"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {isPending && <Loader2 className="text-primary size-4 animate-spin" />}
            {hasQuery && !isPending && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search input"
                className="text-muted-foreground hover:text-foreground rounded-full p-0.5 transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Floating Combobox Dropdown */}
      {isOpen && (
        <div className="bg-popover/95 text-popover-foreground border-border animate-in fade-in-0 zoom-in-95 absolute top-full right-0 left-0 z-50 mt-2 max-h-[480px] overflow-y-auto rounded-2xl border shadow-2xl backdrop-blur-xl duration-150">
          {/* Empty / Initial Focus State: Trending searches & Popular categories */}
          {!hasQuery && (
            <div className="space-y-4 p-4">
              <div>
                <div className="text-muted-foreground mb-2.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                  <TrendingUp className="text-primary size-3.5" />
                  Trending Searches
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSelectTrending(term)}
                      className="bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground border-border/60 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* <div>
                <div className="text-muted-foreground mb-2.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                  <Tag className="text-primary size-3.5" />
                  Popular Categories
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/products?category=${encodeURIComponent(cat.slug)}`}
                      onClick={() => setIsOpen(false)}
                      className="hover:bg-accent hover:text-foreground text-muted-foreground border-border/50 flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors"
                    >
                      <span>{cat.name}</span>
                      <ArrowRight className="size-3 opacity-50" />
                    </Link>
                  ))}
                </div>
              </div> */}
            </div>
          )}

          {/* Live Search Active: Categories Section */}
          {hasQuery && hasCategories && (
            <div className="border-border/60 border-b p-3">
              <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
                <Tag className="text-primary size-3" />
                Matching Categories
              </div>
              <div className="flex flex-wrap gap-1.5">
                {results.categories.map((cat) => {
                  const itemIndex = actionableItems.findIndex(
                    (i) => i.type === "category" && i.label === cat.name
                  );
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <Link
                      key={cat.id || cat.slug}
                      href={`/search?q=${encodeURIComponent(query.trim())}&category=${encodeURIComponent(cat.slug)}`}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "border-border flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 hover:bg-accent text-foreground"
                      )}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] opacity-70">in Search</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Search Active: Products Section */}
          {hasQuery && hasProducts && (
            <div className="space-y-1 p-2">
              <div className="text-muted-foreground flex items-center gap-1.5 px-2 pt-1 pb-1.5 text-[11px] font-semibold tracking-wider uppercase">
                <Package className="text-primary size-3" />
                Matching Products
              </div>
              {results.products.map((product) => {
                const itemIndex = actionableItems.findIndex(
                  (i) => i.type === "product" && i.label === product.name
                );
                const isSelected = selectedIndex === itemIndex;
                const discount = formatDiscount(product.price, product.originalPrice);

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-2 transition-all duration-150",
                      isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="border-border bg-muted relative size-12 shrink-0 overflow-hidden rounded-lg border">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                          <Package className="size-5" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {product.brand && (
                          <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                            {product.brand}
                          </span>
                        )}
                        {product.categoryName && (
                          <span className="text-muted-foreground/60 text-[10px]">
                            • {product.categoryName}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground line-clamp-1 text-sm font-medium">
                        {product.name}
                      </p>
                    </div>

                    {/* Price & Savings */}
                    <div className="shrink-0 text-right">
                      <span className="text-foreground text-sm font-bold">
                        {formatPrice(product.price)}
                      </span>
                      {discount > 0 && (
                        <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {discount}% OFF
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* No Matches Found */}
          {noMatches && (
            <div className="p-6 text-center">
              <Package className="text-muted-foreground/40 mx-auto mb-2 size-8" />
              <p className="text-foreground text-sm font-medium">
                No direct matches for &ldquo;{query}&rdquo;
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Try checking for typos or searching by brand, chipset, or model
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                className="text-primary mt-3 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
              >
                Search whole catalog for &ldquo;{query}&rdquo;
                <ArrowRight className="size-3" />
              </button>
            </div>
          )}

          {/* View All Footer */}
          {hasQuery && (hasProducts || hasCategories) && (
            <div className="border-border/70 bg-muted/30 border-t p-2">
              {(() => {
                const viewAllIndex = actionableItems.findIndex((i) => i.type === "view_all");
                const isSelected = selectedIndex === viewAllIndex;
                return (
                  <Link
                    href={`/search?q=${encodeURIComponent(query.trim())}`}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "text-primary hover:bg-primary/10"
                    )}
                  >
                    <span>
                      View all {results.totalCount > 0 ? results.totalCount : ""} results for
                      &ldquo;{query}&rdquo;
                    </span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
