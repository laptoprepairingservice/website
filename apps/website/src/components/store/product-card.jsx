"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/store/star-rating";
import { formatDiscount, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductCard({ product, className }) {
  const discount = formatDiscount(product.price, product.originalPrice);

  const handleAddToCart = (e) => {
    e.preventDefault();
    toast.success("Added to cart", { description: product.name });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toast.success("Added to wishlist", { description: product.name });
  };

  return (
    <article className={cn("group card-interactive overflow-hidden", className)}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted/30 p-6">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
          {discount > 0 && (
            <Badge variant="discount" className="absolute left-3 top-3">
              -{discount}%
            </Badge>
          )}
          {product.isNew && (
            <Badge variant="secondary" className="absolute right-3 top-3">
              New
            </Badge>
          )}
          <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon-sm"
              className="bg-background/90 backdrop-blur-sm"
              onClick={handleWishlist}
              aria-label="Add to wishlist"
            >
              <Heart />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              className="bg-background/90 backdrop-blur-sm"
              aria-label="Quick view"
            >
              <Eye />
            </Button>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            {product.inStock ? (
              <span className="badge-success">In Stock</span>
            ) : (
              <span className="badge-destructive">Out of Stock</span>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={!product.inStock}
              onClick={handleAddToCart}
              className="shrink-0"
            >
              <ShoppingCart className="size-3.5" />
              Add
            </Button>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({ products, className }) {
  return (
    <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
