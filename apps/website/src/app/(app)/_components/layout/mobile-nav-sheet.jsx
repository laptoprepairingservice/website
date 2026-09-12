"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Laptop,
  Layers,
  Menu,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@ui/shadcn/components/sheet";
import { useAppContext } from "@/app/_context";
import { formatPrice } from "@/lib/format";
import { getUserShortName } from "@/lib/utils";
import {
  getCategoryProductsAction,
  getNavCategoriesAction,
} from "../../_actions/mobile-nav-actions";
import { NotepadText } from "lucide-react";

export function MobileNavSheet({ initialCategories = [] }) {
  const router = useRouter();
  const { user, cartCount, wishlistCount, addToCart } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState("categories"); // "categories" | "products"
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productsCache, setProductsCache] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingProductId, setAddingProductId] = useState(null);

  const isSignedIn = Boolean(user && !user.isGuest);
  const accountHref = isSignedIn ? "/account" : "/login";
  const accountLabel = isSignedIn ? getUserShortName(user) : "Login";

  // Load categories if initial categories were empty
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      getNavCategoriesAction().then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      });
    }
  }, [isOpen, categories.length]);

  // Handle category selection and drill-down
  const handleSelectCategory = async (category) => {
    setSelectedCategory(category);
    setCurrentView("products");

    if (!productsCache[category.slug]) {
      setLoadingProducts(true);
      try {
        const products = await getCategoryProductsAction(category.slug);
        setProductsCache((prev) => ({
          ...prev,
          [category.slug]: products || [],
        }));
      } catch (err) {
        console.error("Failed to load category products:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
  };

  const handleBackToCategories = () => {
    setCurrentView("categories");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleQuickAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (addingProductId) return;
    setAddingProductId(product.id);

    try {
      await addToCart(product, 1);
      toast.success("Added to cart", {
        description: `${product.name} added to your basket.`,
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add to cart");
    } finally {
      setAddingProductId(null);
    }
  };

  const activeCategoryProducts = selectedCategory ? productsCache[selectedCategory.slug] || [] : [];

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
        className="bg-background border-border flex h-full w-[88vw] max-w-sm flex-col gap-0 border-r p-0 shadow-2xl"
      >
        <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Browse laptop hardware categories and products
        </SheetDescription>

        {/* 1. Sheet Header: Store Branding + Search + Close */}
        <div className="border-border bg-card/80 border-b p-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5">
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

        {/* 2. Scrollable Body: Drill-Down Categories vs Products */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {currentView === "categories" ? (
            /* VIEW 1: Categories List */
            <div className="space-y-4 p-4">
              {/* All Products Quick Link */}
              <Link
                href="/products"
                onClick={() => setIsOpen(false)}
                className="border-primary/20 bg-primary/5 hover:bg-primary/10 group flex items-center justify-between rounded-xl border p-3.5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg shadow-xs">
                    <Layers className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-xs font-semibold">All Products</h3>
                    <p className="text-muted-foreground text-[11px]">View full hardware catalog</p>
                  </div>
                </div>
                <ArrowRight className="text-primary size-4 transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Categories Section Heading */}
              <div>
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Shop By Category
                  </h3>
                  <span className="text-muted-foreground text-[11px]">
                    {categories.length} categories
                  </span>
                </div>

                {/* Categories List */}
                <div className="divide-border/60 border-border bg-card mt-2 divide-y overflow-hidden rounded-xl border shadow-2xs">
                  {categories.map((cat) => (
                    <button
                      key={cat.id || cat.slug}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className="hover:bg-muted/40 group flex w-full cursor-pointer items-center justify-between p-3 text-left transition-colors"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {/* Category Image with fallback */}
                        <div className="border-border bg-muted/20 relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
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
                            <Laptop className="text-muted-foreground/60 size-5" />
                          )}
                        </div>

                        {/* Category Name & Count */}
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground group-hover:text-primary truncate text-xs font-semibold transition-colors sm:text-sm">
                            {cat.name}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-[11px]">
                            {cat.count} {cat.count === 1 ? "product" : "products"}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="text-muted-foreground/70 group-hover:text-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* VIEW 2: Category Products Drill-Down */
            <div className="flex min-h-full flex-col">
              {/* Category Products Top Bar */}
              <div className="border-border bg-background/95 sticky top-0 z-10 flex items-center justify-between border-b p-3.5 backdrop-blur-md">
                <button
                  type="button"
                  onClick={handleBackToCategories}
                  className="hover:text-foreground hover:bg-muted/50 text-muted-foreground -ml-1 flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition"
                >
                  <ChevronLeft className="size-4" />
                  <span>Categories</span>
                </button>

                <Link
                  href={`/products?category=${selectedCategory?.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="text-primary text-xs font-semibold hover:underline"
                >
                  See All &rarr;
                </Link>
              </div>

              {/* Category Title Header */}
              <div className="bg-muted/20 border-border/70 border-b p-4">
                <div className="flex items-center gap-3">
                  <div className="border-border bg-card relative size-12 shrink-0 overflow-hidden rounded-xl border p-1">
                    {selectedCategory?.image ? (
                      <Image
                        src={selectedCategory.image}
                        alt={selectedCategory.name}
                        fill
                        unoptimized
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Laptop className="text-muted-foreground size-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-foreground text-sm font-bold sm:text-base">
                      {selectedCategory?.name}
                    </h2>
                    <p className="text-muted-foreground text-xs">
                      {loadingProducts
                        ? "Loading products..."
                        : `${activeCategoryProducts.length} items shown`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Listing */}
              <div className="flex-1 space-y-2.5 p-3">
                {loadingProducts ? (
                  /* Loading Skeletons */
                  Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="border-border/60 bg-card flex animate-pulse gap-3 rounded-xl border p-2.5"
                    >
                      <div className="bg-muted size-16 shrink-0 rounded-lg" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="bg-muted h-3.5 w-3/4 rounded" />
                        <div className="bg-muted h-3 w-1/2 rounded" />
                        <div className="bg-muted h-4 w-1/4 rounded" />
                      </div>
                    </div>
                  ))
                ) : activeCategoryProducts.length > 0 ? (
                  /* Up to 20 Products */
                  activeCategoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border-border/70 bg-card hover:border-primary/40 group flex items-center gap-3 rounded-xl border p-2.5 shadow-2xs transition-all"
                    >
                      {/* Product Thumbnail */}
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="bg-muted/30 border-border/50 relative size-16 shrink-0 overflow-hidden rounded-lg border"
                      >
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            unoptimized
                            sizes="64px"
                            className="object-contain p-1 transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <Package className="text-muted-foreground/40 size-6" />
                          </div>
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="min-w-0 flex-1">
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                          {product.brand}
                        </p>
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="text-foreground hover:text-primary mt-0.5 line-clamp-2 text-xs leading-snug font-semibold transition-colors"
                        >
                          {product.name}
                        </Link>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-foreground text-xs font-bold">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-muted-foreground text-[10px] line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Add to Cart Button */}
                      <Button
                        variant="secondary"
                        size="icon-xs"
                        disabled={!product.inStock || addingProductId === product.id}
                        onClick={(e) => handleQuickAddToCart(e, product)}
                        aria-label={`Add ${product.name} to cart`}
                        className="size-8 shrink-0 cursor-pointer rounded-lg"
                      >
                        <ShoppingCart className="size-3.5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  /* No products in category */
                  <div className="text-muted-foreground py-12 text-center text-xs">
                    <Package className="text-muted-foreground/40 mx-auto mb-2 size-8" />
                    <p className="text-foreground font-medium">No products found</p>
                    <p className="mt-1">
                      New stock for {selectedCategory?.name} will be added soon.
                    </p>
                  </div>
                )}
              </div>

              {/* Prominent "See All" Action at bottom of product list */}
              {selectedCategory && (
                <div className="border-border bg-card/60 mt-auto border-t p-4">
                  <Button className="w-full cursor-pointer justify-between font-medium" asChild>
                    <Link
                      href={`/products?category=${selectedCategory.slug}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>See All {selectedCategory.name} Products</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
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
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
              className="hover:bg-muted/60 text-foreground flex flex-col items-center justify-center rounded-xl py-1.5 transition"
            >
              <Home className="size-4.5" />
              <span className="mt-1 text-[10px] font-medium">Home</span>
            </Link>

            {/* Products */}
            <Link
              href="/blogs"
              onClick={() => setIsOpen(false)}
              className="hover:bg-muted/60 text-foreground flex flex-col items-center justify-center rounded-xl py-1.5 transition"
            >
              <NotepadText className="size-4.5" />
              <span className="mt-1 text-[10px] font-medium">Blogs</span>
            </Link>

            {/* Wishlist with badge */}
            <Link
              href="/wishlist"
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
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
