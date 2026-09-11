"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { StarRating } from "@/components/store/star-rating";
import { formatDiscount, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductCard({ product, className }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  console.log(product.image)

  const discount = formatDiscount(product.price, product.originalPrice);
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  const savings = hasDiscount
    ? product.originalPrice - product.price
    : 0;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsWishlisted((value) => !value);

    toast.success(
      isWishlisted ? "Removed from wishlist" : "Saved to wishlist",
      { description: product.name }
    );
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);

    toast.success("Added to cart", {
      description: `${product.name} has been added to your basket.`,
      action: {
        label: "View Cart",
        onClick: () => {
          window.location.href = "/cart";
        },
      },
    });

    setTimeout(() => setIsAdding(false), 1200);
  };

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition hover:border-primary/40 hover:shadow-xl",
        className
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-1 flex-col"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/20 p-5">
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
            {discount > 0 && (
              <Badge variant="destructive">
                -{discount}% OFF
              </Badge>
            )}

            {product.isBestSeller && (
              <Badge variant="secondary">
                Best Seller
              </Badge>
            )}
          </div>

          {/* Wishlist */}
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={handleWishlist}
            aria-label={
              isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            className={cn(
              "absolute right-2.5 top-2.5 z-10 size-8 rounded-full",
              isWishlisted && "text-destructive"
            )}
          >
            <Heart
              className={cn(
                "size-4",
                isWishlisted && "fill-destructive"
              )}
            />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div className="space-y-2">
            {/* Brand / Stock */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                {product.brand}
              </span>

              <span
                className={cn(
                  "text-[11px] font-medium",
                  product.inStock
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-500"
                )}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Name */}
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
              {product.name}
            </h3>

            {/* Rating */}
            <StarRating
              rating={product.rating}
              reviewCount={product.reviewCount}
            />
          </div>

          {/* Price + Button */}
          <div className="mt-4 flex flex-col gap-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold sm:text-xl">
                  {formatPrice(product.price)}
                </span>

                {hasDiscount && (
                  <span className="text-xs text-muted-foreground line-through">
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
              className="h-10 w-full rounded-xl"
            >
              {isAdding ? (
                <>
                  <Check className="mr-1.5 size-4" />
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
      </Link>
    </article>
  );
}

export function ProductGrid({
  products = [],
  className,
  columns = 4,
}) {
  const columnsMap = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6",
        columnsMap[columns] ?? columnsMap[4],
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}