"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronRight, Laptop, ArrowRight, PackageOpen } from "lucide-react";
import { buildCategoryTree } from "@/lib/store";
import { getCategoryProductsAction } from "../../_actions/mobile-nav-actions";

/* ─── Static primary nav links (non-product) ───────────────────────────────── */
const NAV_LINKS = [
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

/* ─── Skeleton row ──────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="border-border/40 flex items-center gap-2 rounded-lg border p-2">
      <div className="bg-muted size-6 animate-pulse rounded" />
      <div className="bg-muted h-3 flex-1 animate-pulse rounded" />
      <div className="bg-muted h-3 w-10 animate-pulse rounded" />
    </div>
  );
}

/* ─── Products fallback panel (no subcategories) ───────────────────────────── */
function CategoryProductsPanel({ category, onNavigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setProducts([]);
    getCategoryProductsAction(category.slug).then((data) => {
      if (!cancelled) {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [category.slug]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-1.5 py-8 text-center text-xs">
        <PackageOpen className="text-muted-foreground/40 size-7" />
        <span>No products found in {category.name}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {products.map((product) => {
        const href = product.brandSlug && product.categorySlug && product.slug
          ? `/${product.brandSlug}/${product.categorySlug}/${product.slug}`
          : `/${product.slug}`;

        return (
          <Link
            key={product.id ?? product.slug}
            href={href}
            onClick={onNavigate}
            className="border-border/60 bg-card/60 hover:bg-muted/60 hover:border-primary/30 group flex items-center gap-2 rounded-lg border p-2 text-xs transition"
          >
            <div className="border-border/50 bg-muted/30 relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded border">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="28px"
                  className="object-contain p-0.5"
                />
              ) : (
                <Laptop className="text-muted-foreground/60 size-3.5" />
              )}
            </div>
            <span className="text-foreground group-hover:text-primary min-w-0 flex-1 truncate font-medium transition-colors">
              {product.name}
            </span>
            {product.price != null && (
              <span className="text-muted-foreground/70 ml-auto shrink-0 font-mono text-[10px]">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

/* ─── Subcategory column ────────────────────────────────────────────────────── */
function SubcategoryPanel({ category, onNavigate }) {
  if (!category) return null;
  const subs = category.subcategories ?? [];

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4">
      {/* Category header */}
      <div className="border-border/60 mb-3 flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <div className="border-border bg-muted relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                unoptimized
                sizes="28px"
                className="object-contain p-0.5"
              />
            ) : (
              <Laptop className="text-muted-foreground size-3.5" />
            )}
          </div>
          <span className="text-foreground text-sm font-semibold">{category.name}</span>
        </div>
        <Link
          href={`/${category.slug}`}
          onClick={onNavigate}
          className="text-primary hover:text-primary/80 flex items-center gap-0.5 text-xs font-medium transition"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Subcategories or products fallback */}
      {subs.length > 0 ? (
        <div className="grid grid-cols-2 gap-1.5">
          {subs.map((sub) => (
            <Link
              key={sub.id ?? sub.slug}
              href={`/${sub.slug}`}
              onClick={onNavigate}
              className="border-border/60 bg-card/60 hover:bg-muted/60 hover:border-primary/30 group flex items-center gap-2 rounded-lg border p-2 text-xs transition"
            >
              <div className="border-border/50 bg-muted/30 relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded border">
                {sub.image ? (
                  <Image
                    src={sub.image}
                    alt={sub.name}
                    fill
                    unoptimized
                    sizes="24px"
                    className="object-contain p-0.5"
                  />
                ) : (
                  <span className="bg-primary/70 size-1.5 rounded-full" />
                )}
              </div>
              <span className="text-foreground group-hover:text-primary min-w-0 truncate font-medium transition-colors">
                {sub.name}
              </span>
              {sub.count > 0 && (
                <span className="text-muted-foreground/70 ml-auto shrink-0 font-mono text-[10px]">
                  {sub.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        /* No subcategories → show actual products */
        <>
          <p className="text-muted-foreground mb-2 text-[10px] font-semibold uppercase tracking-wider">
            Products
          </p>
          <CategoryProductsPanel category={category} onNavigate={onNavigate} />
        </>
      )}
    </div>
  );
}


/* ─── Products mega-menu ────────────────────────────────────────────────────── */
function ProductsMegaMenu({ categories, onNavigate }) {
  const tree = buildCategoryTree(categories);
  const [activeId, setActiveId] = useState(tree[0]?.id ?? null);
  const activeCategory = tree.find((c) => String(c.id) === String(activeId)) ?? tree[0] ?? null;

  if (!tree.length) return null;

  return (
    <div className="border-border bg-popover text-popover-foreground flex h-105 w-170 overflow-hidden rounded-xl border shadow-2xl">
      {/* Left: category list */}
      <div className="border-border bg-muted/30 w-44 shrink-0 overflow-y-auto border-r">
        <p className="text-muted-foreground px-3 pt-3 pb-1 text-[10px] font-semibold tracking-wider uppercase">
          Categories
        </p>
        <div className="space-y-0.5 p-1.5">
          {tree.map((cat) => {
            const isActive = String(cat.id) === String(activeId ?? tree[0]?.id);
            return (
              <button
                key={cat.id ?? cat.slug}
                type="button"
                onMouseEnter={() => setActiveId(cat.id)}
                onClick={() => setActiveId(cat.id)}
                className={`group flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-all ${
                  isActive
                    ? "bg-background text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                }`}
              >
                <div
                  className={`relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border transition ${
                    isActive
                      ? "border-primary/40 bg-background shadow-xs"
                      : "border-border/60 bg-background/60"
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
                {isActive && <ChevronRight className="text-primary size-3 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: subcategory panel */}
      <SubcategoryPanel category={activeCategory} onNavigate={onNavigate} />
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
