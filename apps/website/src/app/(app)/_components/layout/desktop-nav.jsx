"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronRight, Laptop, ArrowRight, PackageOpen, Package } from "lucide-react";

/* ─── Static primary nav links (non-product) ───────────────────────────────── */
const NAV_LINKS = [
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

/* ─── Available Brands Panel for selected category ─────────────────────────── */
function CategoryBrandsPanel({ category, onNavigate }) {
  if (!category) {
    return (
      <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center p-8 text-center text-xs">
        <PackageOpen className="text-muted-foreground/40 mb-2 size-8" />
        <span>Select a category on the left to view available brands.</span>
      </div>
    );
  }

  const brands = Array.isArray(category.brands) ? category.brands : [];

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4 sm:p-5">
      {/* Category header banner */}
      <div className="border-border/60 bg-muted/20 mb-4 flex items-center justify-between rounded-xl border p-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="border-border bg-background relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border shadow-2xs">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                unoptimized
                sizes="36px"
                className="object-contain p-1"
              />
            ) : (
              <Laptop className="text-muted-foreground size-4" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-foreground truncate text-sm font-bold tracking-tight">
              {category.name}
            </h3>
            <p className="text-muted-foreground text-[11px]">
              {brands.length > 0
                ? `${brands.length} ${brands.length === 1 ? "brand" : "brands"} available • ${category.count || 0} products`
                : "No products currently available"}
            </p>
          </div>
        </div>
      </div>

      {/* Available Brands Label */}
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Available Brands
        </p>
        <span className="text-muted-foreground text-xs">
          {brands.length} {brands.length === 1 ? "brand" : "brands"} with products
        </span>
      </div>

      {/* Brands Cards Grid or Empty State */}
      {brands.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {brands.map((brand) => (
            <Link
              key={brand.id || brand.slug}
              href={`/${brand.slug}/${category.slug}`}
              onClick={onNavigate}
              className="border-border/70 bg-card/70 hover:bg-muted/60 hover:border-primary/40 group relative flex flex-col justify-between rounded-xl border p-3 transition-all duration-150 hover:shadow-xs"
            >
              {/* Top row: Brand logo + Arrow */}
              <div className="flex items-start justify-between gap-2">
                <div className="border-border/60 bg-background relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border p-1 shadow-2xs transition-transform group-hover:scale-105">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      unoptimized
                      sizes="36px"
                      className="object-contain p-0.5"
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs font-bold">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="text-muted-foreground/50 group-hover:text-primary flex size-6 items-center justify-center rounded-full transition-colors">
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Brand name & product count */}
              <div className="mt-2.5 min-w-0">
                <span className="text-foreground group-hover:text-primary block truncate text-xs font-semibold transition-colors">
                  {brand.name}
                </span>
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Package className="text-primary/70 size-3" />
                  {brand.productCount} {brand.productCount === 1 ? "Product" : "Products"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="border-border/80 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
          <PackageOpen className="text-muted-foreground/40 mb-2 size-8" />
          <p className="text-foreground text-xs font-semibold">No brands available</p>
          <p className="text-muted-foreground mt-0.5 max-w-xs text-[11px]">
            There are currently no active products in {category.name}. Check back soon as we restock
            items!
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Products mega-menu ────────────────────────────────────────────────────── */
function ProductsMegaMenu({ categories = [], onNavigate }) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? null);
  const activeCategory =
    categories.find((c) => String(c.id) === String(activeId)) ?? categories[0] ?? null;

  if (!categories || !categories.length) return null;

  return (
    <div className="border-border bg-popover text-popover-foreground flex h-110 w-[720px] max-w-[90vw] overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md">
      {/* Left: category list */}
      <div className="border-border bg-muted/20 w-52 shrink-0 overflow-y-auto border-r p-2 sm:w-56">
        <div className="flex items-center justify-between px-2 pt-1.5 pb-2">
          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Categories
          </span>
          <span className="text-muted-foreground text-xs">{categories.length}</span>
        </div>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isActive = String(cat.id) === String(activeCategory?.id);
            return (
              <button
                key={cat.id ?? cat.slug}
                type="button"
                onMouseEnter={() => setActiveId(cat.id)}
                onClick={() => setActiveId(cat.id)}
                className={`group flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-all ${
                  isActive
                    ? "bg-background text-foreground border-border/80 border font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                }`}
              >
                <div
                  className={`relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border transition ${
                    isActive
                      ? "border-primary/50 bg-background ring-primary/20 shadow-xs ring-1"
                      : "border-border/60 bg-background/70"
                  }`}
                >
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      unoptimized
                      sizes="28px"
                      className="object-contain p-0.5"
                    />
                  ) : (
                    <Laptop
                      className={`size-3.5 ${isActive ? "text-primary" : "text-muted-foreground/70"}`}
                    />
                  )}
                </div>
                <span className="min-w-0 flex-1 truncate leading-tight">{cat.name}</span>
                {cat.count > 0 && (
                  <span className="text-muted-foreground/70 font-mono text-xs">{cat.count}</span>
                )}
                {isActive && <ChevronRight className="text-primary size-3 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Available Brands panel for active category */}
      <CategoryBrandsPanel category={activeCategory} onNavigate={onNavigate} />
    </div>
  );
}

/* ─── Desktop nav ────────────────────────────────────────────────────────────── */
export function DesktopNav({ categories = [] }) {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const closeTimer = useRef(null);

  const open = useCallback(() => {
    clearTimeout(closeTimer.current);
    setIsProductsOpen(true);
  }, []);

  const close = useCallback(() => {
    closeTimer.current = setTimeout(() => setIsProductsOpen(false), 120);
  }, []);

  const cancelClose = useCallback(() => {
    clearTimeout(closeTimer.current);
  }, []);

  const handleNavigate = useCallback(() => {
    clearTimeout(closeTimer.current);
    setIsProductsOpen(false);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isProductsOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setIsProductsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isProductsOpen]);

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
      {/* Products trigger */}
      <div className="relative" onMouseEnter={open} onMouseLeave={close}>
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={isProductsOpen}
          onClick={() => setIsProductsOpen((p) => !p)}
          className={`text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isProductsOpen ? "text-foreground" : ""
          }`}
        >
          Products
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${isProductsOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Mega-menu panel */}
        {isProductsOpen && (
          <div
            className="absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/3"
            onMouseEnter={cancelClose}
            onMouseLeave={close}
          >
            <ProductsMegaMenu categories={categories} onNavigate={handleNavigate} />
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="bg-border h-4 w-px" aria-hidden />

      {/* Static links */}
      {NAV_LINKS.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
