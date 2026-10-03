"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Heart,
  Home,
  Laptop,
  Menu,
  NotepadText,
  PackageOpen,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

import { Button } from "@ui/shadcn/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@ui/shadcn/components/sheet";
import { useAppContext } from "@/app/_context";
import { getUserShortName } from "@/lib/utils";
import { getNavCategoriesAction } from "../../_actions/mobile-nav-actions";

export function MobileNavSheet({ initialCategories = [] }) {
  const router = useRouter();
  const { user, cartCount, wishlistCount } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const isSignedIn = Boolean(user && !user.isGuest);
  const accountHref = isSignedIn ? "/account" : "/login";
  const accountLabel = isSignedIn ? getUserShortName(user) : "Login";

  const categories = initialCategories.length > 0 ? initialCategories : fetchedCategories;
  const activeCategoryId = selectedCategoryId ?? categories[0]?.id ?? null;

  // Load categories if initial categories were empty
  useEffect(() => {
    if (isOpen && initialCategories.length === 0 && fetchedCategories.length === 0) {
      getNavCategoriesAction().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFetchedCategories(data);
        }
      });
    }
  }, [isOpen, initialCategories.length, fetchedCategories.length]);

  const activeCategory = useMemo(() => {
    if (!categories.length) return null;
    return categories.find((c) => String(c.id) === String(activeCategoryId)) || categories[0];
  }, [categories, activeCategoryId]);

  const activeBrands = useMemo(() => {
    if (!activeCategory || !Array.isArray(activeCategory.brands)) return [];
    return activeCategory.brands;
  }, [activeCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleNavigate = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          className="text-foreground -ml-1 shrink-0 cursor-pointer md:hidden"
        >
          <Menu className="size-5.5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        showCloseButton={false}
        className="bg-background border-border flex h-full w-[95vw] max-w-md flex-col gap-0 border-r p-0 shadow-2xl sm:max-w-lg lg:max-w-xl"
      >
        <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Browse hardware categories and available product brands
        </SheetDescription>

        {/* 1. Sheet Header: Store Branding + Search + Close */}
        <div className="border-border bg-card/80 border-b p-3.5 backdrop-blur-md sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" onClick={handleNavigate} className="flex items-center gap-2.5">
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold shadow-xs">
                CV
              </div>
              <div>
                <span className="text-foreground text-base font-semibold tracking-tight">
                  Ranuja
                </span>
                <p className="text-muted-foreground -mt-0.5 text-[10px]">Ahmedabad</p>
              </div>
            </Link>

            <SheetClose asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground hover:bg-muted/60 flex size-8 cursor-pointer items-center justify-center rounded-full transition"
                aria-label="Close menu"
              >
                <X className="size-4.5" />
              </button>
            </SheetClose>
          </div>

          {/* Search bar inside sheet */}
          <form onSubmit={handleSearchSubmit} className="relative mt-3">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components, laptop parts..."
              className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary h-9 w-full rounded-xl border pr-3 pl-9 text-xs shadow-2xs focus:ring-1 focus:outline-none"
            />
          </form>
        </div>

        {/* 2. Scrollable Body: Two-Section Split View (Categories on Left, Available Brands on Right) */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* LEFT SECTION: Categories */}
          <div className="border-border bg-muted/20 flex w-24 shrink-0 flex-col overflow-y-auto border-r sm:w-28">
            {/* Categories Header */}
            <div className="px-2 pt-2.5 pb-1 text-center">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Categories
              </span>
            </div>

            {/* Categories Navigation List */}
            <div className="flex-1 space-y-1.5 p-1.5">
              {categories.map((cat) => {
                const isSelected = activeCategory?.id === cat.id;

                return (
                  <button
                    key={cat.id || cat.slug}
                    type="button"
                    onMouseEnter={() => setSelectedCategoryId(cat.id)}
                    onFocus={() => setSelectedCategoryId(cat.id)}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl p-2 text-center transition-all ${
                      isSelected
                        ? "bg-card text-foreground border-border/80 border font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    {/* Category Thumbnail / Icon (Rounded) */}
                    <div
                      className={`relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border transition-all ${
                        isSelected
                          ? "border-primary ring-primary/25 bg-background shadow-xs ring-2"
                          : "border-border/60 bg-background/80 group-hover:border-border"
                      }`}
                    >
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          unoptimized
                          sizes="44px"
                          className="object-contain p-1 transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <Laptop
                          className={`size-4.5 ${
                            isSelected ? "text-primary" : "text-muted-foreground/70"
                          }`}
                        />
                      )}
                    </div>

                    {/* Category Name below image */}
                    <span
                      className={`mt-1.5 line-clamp-2 text-[11px] leading-tight transition-colors ${
                        isSelected
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT SECTION: Available Brands of Selected Category */}
          <div className="bg-background flex min-w-0 flex-1 flex-col overflow-y-auto">
            {activeCategory ? (
              <div className="space-y-4 p-3.5 sm:p-4">
                {/* Active Category Header Card */}
                <div className="border-border/80 bg-card rounded-xl border p-3 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="border-border bg-muted/20 relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                        {activeCategory.image ? (
                          <Image
                            src={activeCategory.image}
                            alt={activeCategory.name}
                            fill
                            unoptimized
                            sizes="36px"
                            className="object-contain p-1"
                          />
                        ) : (
                          <Laptop className="text-muted-foreground/70 size-4.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-foreground truncate text-xs font-bold sm:text-sm">
                          {activeCategory.name}
                        </h3>
                        <p className="text-muted-foreground text-[11px]">
                          {activeCategory.count > 0
                            ? `${activeCategory.count} products total`
                            : "Explore category"}
                        </p>
                      </div>
                    </div>

                    <span className="text-muted-foreground/80 bg-muted/40 border-border/80 shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium">
                      {activeBrands.length} {activeBrands.length === 1 ? "Brand" : "Brands"}
                    </span>
                  </div>
                </div>

                {/* Available Brands Section */}
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <h4 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                      Available Brands
                    </h4>
                    <span className="text-muted-foreground text-[11px]">
                      {activeBrands.length}{" "}
                      {activeBrands.length === 1 ? "brand" : "brands"}
                    </span>
                  </div>

                  {activeBrands.length > 0 ? (
                    <div className="grid grid-cols-1 gap-1.5">
                      {activeBrands.map((brand) => (
                        <Link
                          key={brand.id || brand.slug}
                          href={`/${brand.slug}/${activeCategory.slug}`}
                          onClick={handleNavigate}
                          className="border-border/60 bg-card/60 hover:bg-muted/50 hover:border-primary/40 group flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            {/* Brand Logo / Icon */}
                            <div className="border-border/50 bg-background relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border p-1 shadow-2xs group-hover:scale-105 transition-transform">
                              {brand.logo ? (
                                <Image
                                  src={brand.logo}
                                  alt={brand.name}
                                  fill
                                  unoptimized
                                  sizes="32px"
                                  className="object-contain p-0.5"
                                />
                              ) : (
                                <span className="text-muted-foreground text-[11px] font-bold">
                                  {brand.name.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <span className="text-foreground group-hover:text-primary truncate font-semibold transition-colors">
                              {brand.name}
                            </span>
                          </div>

                          <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-[11px]">
                            <span className="text-muted-foreground/80 font-normal">
                              {brand.productCount} {brand.productCount === 1 ? "item" : "items"}
                            </span>
                            <ChevronRight className="text-muted-foreground/60 group-hover:text-primary size-3.5 transition-all group-hover:translate-x-0.5" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    /* Empty Brands State */
                    <div className="border-border rounded-xl border border-dashed p-6 text-center">
                      <PackageOpen className="text-muted-foreground/40 mx-auto mb-2 size-8" />
                      <p className="text-foreground text-xs font-semibold">No brands available</p>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        There are currently no active products in {activeCategory.name}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center p-6 text-center text-xs">
                Select a category on the left to view available brands.
              </div>
            )}
          </div>
        </div>

        {/* 3. Footer: Menu Links With Icons */}
        <div className="border-border bg-card/95 pb-safe border-t p-3 backdrop-blur-md">
          {/* User quick status banner */}
          <div className="border-border/50 mb-2 flex items-center justify-between border-b px-1 pb-2.5 text-xs">
            <span className="text-muted-foreground truncate">
              {isSignedIn ? `Signed in as ${user?.name || user?.email}` : "Guest customer"}
            </span>
            <Link
              href={accountHref}
              onClick={handleNavigate}
              className="text-primary ml-2 shrink-0 font-semibold hover:underline"
            >
              {isSignedIn ? "Account" : "Sign In"}
            </Link>
          </div>

          {/* Quick Menu Icons Grid */}
          <div className="grid grid-cols-5 gap-1 text-center">
            {/* Home */}
            <Link
              href="/"
              onClick={handleNavigate}
              className="hover:bg-muted/60 text-foreground flex flex-col items-center justify-center rounded-xl py-1.5 transition"
            >
              <Home className="size-4.5" />
              <span className="mt-1 text-[10px] font-medium">Home</span>
            </Link>

            {/* Blogs */}
            <Link
              href="/blogs"
              onClick={handleNavigate}
              className="hover:bg-muted/60 text-foreground flex flex-col items-center justify-center rounded-xl py-1.5 transition"
            >
              <NotepadText className="size-4.5" />
              <span className="mt-1 text-[10px] font-medium">Blogs</span>
            </Link>

            {/* Wishlist with badge */}
            <Link
              href="/wishlist"
              onClick={handleNavigate}
              className="hover:bg-muted/60 text-foreground relative flex flex-col items-center justify-center rounded-xl py-1.5 transition"
            >
              <div className="relative">
                <Heart className="size-4.5" />
                {wishlistCount > 0 && (
                  <span className="bg-primary text-primary-foreground absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[9px] leading-none font-semibold">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[10px] font-medium">Wishlist</span>
            </Link>

            {/* Cart with badge */}
            <Link
              href="/cart"
              onClick={handleNavigate}
              className="hover:bg-muted/60 text-foreground relative flex flex-col items-center justify-center rounded-xl py-1.5 transition"
            >
              <div className="relative">
                <ShoppingCart className="size-4.5" />
                {cartCount > 0 && (
                  <span className="bg-primary text-primary-foreground absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[9px] leading-none font-semibold">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[10px] font-medium">Cart</span>
            </Link>

            {/* Account */}
            <Link
              href={accountHref}
              onClick={handleNavigate}
              className="hover:bg-muted/60 text-foreground flex flex-col items-center justify-center rounded-xl py-1.5 transition"
            >
              <User className="size-4.5" />
              <span className="mt-1 max-w-[48px] truncate text-[10px] font-medium">
                {accountLabel}
              </span>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
