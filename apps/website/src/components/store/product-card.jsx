"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Eye, Heart, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { StarRating } from "@/components/store/star-rating";
import { formatDiscount, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductCard({ product, className, compact = false }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const discount = formatDiscount(product.price, product.originalPrice);
  const savings = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : 0;

  // Extract key specs for preview pills
  const specPills = [];
  if (product.specs) {
    if (product.specs.cores) specPills.push(`${product.specs.cores} Cores`);
    if (product.specs.memory) specPills.push(product.specs.memory);
    if (product.specs.capacity) specPills.push(product.specs.capacity);
    if (product.specs["read-speed"]) specPills.push(product.specs["read-speed"]);
    if (product.specs.refreshRate) specPills.push(product.specs.refreshRate);
    if (product.specs.wattage) specPills.push(product.specs.wattage);
    if (product.specs.chipset) specPills.push(product.specs.chipset);
    if (product.specs.sensor) specPills.push(product.specs.sensor);
  }

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    toast.success("Added to cart", {
      description: `${product.name} has been added to your basket.`,
      action: {
        label: "View Cart",
        onClick: () => window.location.href = "/cart",
      },
    });
    setTimeout(() => setIsAdding(false), 1200);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted ? "Removed from wishlist" : "Saved to wishlist",
      { description: product.name }
    );
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-xl dark:hover:shadow-primary/5",
        className
      )}
    >
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
        {/* Top Product Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted/20 p-5 flex items-center justify-center">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-500"
          />

          {/* Floating Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {discount > 0 && (
              <Badge variant="destructive" className="font-bold text-[11px] px-2 py-0.5 shadow-sm">
                -{discount}% OFF
              </Badge>
            )}
            {product.isNew && (
              <Badge variant="secondary" className="font-semibold text-[11px] px-2 py-0.5 shadow-sm bg-primary/10 text-primary border border-primary/20">
                New Arrival
              </Badge>
            )}
            {product.isBestSeller && !product.isNew && (
              <Badge variant="secondary" className="font-semibold text-[11px] px-2 py-0.5 shadow-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Best Seller
              </Badge>
            )}
          </div>

          {/* Quick Action Overlay on Image */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
            <Button
              variant="secondary"
              size="icon-sm"
              className={cn(
                "size-8 rounded-full border border-border/60 bg-background/90 backdrop-blur-md shadow-xs transition-all duration-200 hover:scale-110",
                isWishlisted ? "text-destructive border-destructive/30" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={handleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={cn("size-4", isWishlisted && "fill-destructive")} />
            </Button>
          </div>

          {/* Micro Specs Tags on Bottom of Image */}
          {specPills.length > 0 && (
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 opacity-90">
              {specPills.slice(0, 2).map((spec, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md bg-background/85 px-1.5 py-0.5 text-[10px] font-medium text-foreground/90 backdrop-blur-xs border border-border/40 shadow-2xs"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div className="space-y-2">
            {/* Brand & Stock Status */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground text-[11px]">
                {product.brand}
              </span>
              <div className="flex items-center gap-1.5 text-[11px]">
                {product.inStock ? (
                  <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-medium text-rose-500">
                    <span className="size-1.5 rounded-full bg-rose-500" />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Product Title */}
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="pt-0.5">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            </div>
          </div>

          {/* Pricing & CTA Button */}
          <div className="mt-4 pt-3 border-t border-border/60 flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-1 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground sm:text-xl">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Save {formatPrice(savings)}
                </span>
              )}
            </div>

            <Button
              size="sm"
              variant={product.inStock ? "default" : "outline"}
              disabled={!product.inStock || isAdding}
              onClick={handleAddToCart}
              className={cn(
                "w-full rounded-xl font-medium text-xs sm:text-sm h-10 transition-all",
                product.inStock
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-[0.98]"
                  : "opacity-60 cursor-not-allowed"
              )}
            >
              {isAdding ? (
                <>
                  <Check className="size-4 mr-1.5 text-emerald-300" />
                  Added!
                </>
              ) : product.inStock ? (
                <>
                  <ShoppingCart className="size-4 mr-1.5" />
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

export function ProductGrid({ products, className, columns = 4 }) {
  const colMap = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6",
        colMap[columns] || colMap[4],
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
