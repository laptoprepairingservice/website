"use client";

import { Check, ChevronLeft, ChevronRight, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { A11y, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useAppContext } from "@/app/_context";
import { StarRating } from "@/components/store/star-rating";
import { formatDiscount, formatPrice } from "@/lib/format";
import { getProductUrl } from "@/lib/url";
import { cn } from "@/lib/utils";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import "swiper/css";
import "swiper/css/navigation";

export function ProductCard({ product, className }) {
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { user, addToCart, isInWishlist, toggleWishlist } = useAppContext();

  const isWishlisted = isInWishlist(product.id);

  const discount = formatDiscount(product.price, product.originalPrice);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const savings = hasDiscount ? product.originalPrice - product.price : 0;

  const productUrl = getProductUrl(product);

  /* ------------------------------------------------------------------------ */
  /* Wishlist                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isTogglingWishlist) return;

    if (!user || user.isGuest) {
      toast.error("Please sign in to save items to your wishlist", {
        action: {
          label: "Sign In",
          onClick: () => {
            const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
            window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
          },
        },
      });

      return;
    }

    setIsTogglingWishlist(true);

    try {
      const result = await toggleWishlist(product);

      if (result?.action === "added") {
        toast.success("Saved to wishlist", {
          description: product.name,
        });
      }

      if (result?.action === "removed") {
        toast.success("Removed from wishlist", {
          description: product.name,
        });
      }

      if (result?.requiresAuth) {
        toast.error("Please sign in to save items to your wishlist");
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Cart                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleAddToCart = async () => {
    if (isAdding) return;

    setIsAdding(true);

    try {
      await addToCart(product, 1);

      toast.success("Added to cart", {
        description: `${product.name} has been added to your basket.`,
        action: {
          label: "View Cart",
          onClick: () => {
            window.location.href = "/cart";
          },
        },
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article
      className={cn(
        "group bg-card hover:border-primary/40 relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-xs transition hover:shadow-xl",
        className
      )}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Media                                                               */}
      {/* ------------------------------------------------------------------ */}

      <div className="bg-muted/20 relative aspect-square overflow-hidden">
        <Link href={productUrl} className="relative block size-full">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ShoppingCart className="text-muted-foreground/30 size-12" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
          {discount > 0 && <Badge variant="destructive">-{discount}% OFF</Badge>}

          {product.isBestSeller && <Badge variant="secondary">Best Seller</Badge>}
        </div>

        {/* Wishlist */}
        <Button
          variant="secondary"
          size="icon-sm"
          onClick={handleWishlist}
          disabled={isTogglingWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-2.5 right-2.5 z-10 size-8 cursor-pointer rounded-full shadow-xs",
            isWishlisted && "bg-card text-destructive hover:bg-card/90"
          )}
        >
          <Heart
            className={cn(
              "size-4 transition-transform duration-200",
              isWishlisted && "fill-destructive text-destructive scale-110"
            )}
          />
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <Link href={productUrl} className="block space-y-2">
          {/* Brand / Stock */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground truncate font-semibold tracking-wider uppercase">
              {product.brand}
            </span>

            <span
              className={cn(
                "shrink-0 text-[11px] font-medium",
                product.inStock ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
              )}
            >
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Name */}
          <h3 className="group-hover:text-primary line-clamp-2 text-sm leading-snug font-semibold transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </Link>

        {/* Price / Cart */}
        <div className="mt-4 flex flex-col gap-3 border-t pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold sm:text-xl">{formatPrice(product.price)}</span>

              {hasDiscount && (
                <span className="text-muted-foreground text-xs line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {savings > 0 && (
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Save {formatPrice(savings)}
              </span>
            )}
          </div>

          <Button
            size="sm"
            disabled={!product.inStock || isAdding}
            onClick={handleAddToCart}
            className="h-10 w-full cursor-pointer rounded-xl"
          >
            {isAdding ? (
              <>
                <Check className="animate-in zoom-in-50 mr-1.5 size-4" />
                Added!
              </>
            ) : product.inStock ? (
              <>
                <ShoppingCart className="mr-1.5 size-4" />
                Add to Cart
              </>
            ) : (
              "Notify When In Stock"
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Product Slider                                                             */
/* -------------------------------------------------------------------------- */

export function ProductGrid({ products = [], className, showNavigation = false }) {
  if (!products.length) {
    return null;
  }

  return (
    <section className={cn("group/product-slider relative w-full overflow-x-clip", className)}>
      <Swiper
        modules={[A11y]}
        navigation={{
          nextEl: ".product-slider-next",
          prevEl: ".product-slider-prev",
        }}
        spaceBetween={16}
        slidesPerView={1.25}
        breakpoints={{
          480: {
            slidesPerView: 1.75,
            spaceBetween: 16,
          },

          640: {
            slidesPerView: 2.25,
            spaceBetween: 16,
          },

          768: {
            slidesPerView: 3,
            spaceBetween: 20,
          },

          1024: {
            slidesPerView: 4,
            spaceBetween: 20,
          },

          1280: {
            slidesPerView: 4,
            spaceBetween: 24,
          },
        }}
        className="!overflow-visible"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="!h-auto">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ------------------------------------------------------------------ */}
      {/* Navigation                                                           */}
      {/* ------------------------------------------------------------------ */}

      {showNavigation && products.length > 4 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "product-slider-prev",
              "bg-background absolute top-1/2 left-0 z-20 hidden size-10 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md",
              "md:flex",
              "opacity-0 transition-opacity group-hover/product-slider:opacity-100"
            )}
            aria-label="Previous products"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "product-slider-next",
              "bg-background absolute top-1/2 right-0 z-20 hidden size-10 translate-x-1/2 -translate-y-1/2 rounded-full shadow-md",
              "md:flex",
              "opacity-0 transition-opacity group-hover/product-slider:opacity-100"
            )}
            aria-label="Next products"
          >
            <ChevronRight className="size-5" />
          </Button>
        </>
      )}
    </section>
  );
}
