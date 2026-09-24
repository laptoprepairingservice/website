"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { StarRating } from "@/components/store/star-rating";
import { formatDiscount, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/app/_context";

export function ProductInfo({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const checkOverflow = () => {
      if (!isExpanded && el) {
        setCanExpand(el.scrollHeight > el.clientHeight + 1);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [product.shortDescription, isExpanded]);

  const { user, addToCart, isInWishlist, toggleWishlist } = useAppContext();

  const isWishlisted = isInWishlist(product.id);
  const discount = formatDiscount(product.price, product.originalPrice);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const savings = hasDiscount ? product.originalPrice - product.price : 0;

  const handleWishlist = async () => {
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
        toast.success("Saved to wishlist", { description: product.name });
      } else if (result?.action === "removed") {
        toast.success("Removed from wishlist", { description: product.name });
      } else if (result?.requiresAuth) {
        toast.error("Please sign in to save items to your wishlist");
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
      toast.error("Failed to update wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await addToCart(product, quantity);
      toast.success("Added to cart", {
        description: `${quantity} × ${product.name} added to your basket.`,
        action: {
          label: "View Cart",
          onClick: () => {
            window.location.href = "/cart";
          },
        },
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand & Bestseller Badge */}
      <div>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
            {product.brand}
          </p>
          {product.isBestSeller && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-400">
              Bestseller
            </span>
          )}
        </div>
        <h1 className="text-foreground mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          {product.name}
        </h1>
        <div className="mt-3.5">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-foreground text-3xl font-bold tracking-tight">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-muted-foreground text-lg line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <Badge variant="discount">-{discount}%</Badge>
            </>
          )}
        </div>
        {savings > 0 && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            You save {formatPrice(savings)} ({discount}% off)
          </p>
        )}
      </div>

      {/* Product Meta: SKU & Stock Availability */}
      <div className="border-border flex flex-wrap items-center gap-x-6 gap-y-2 border-y py-3 text-sm">
        {product.sku && (
          <div>
            <span className="text-muted-foreground">SKU:</span>{" "}
            <span className="font-mono font-medium">{product.sku}</span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">Availability:</span>{" "}
          {product.inStock ? (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">● In Stock</span>
          ) : (
            <span className="text-destructive font-medium">● Out of Stock</span>
          )}
        </div>
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <div className="space-y-1.5">
          <p
            ref={textRef}
            className={cn(
              "text-muted-foreground text-sm leading-relaxed",
              !isExpanded && "line-clamp-3"
            )}
          >
            {product.shortDescription}
          </p>
          {canExpand && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-primary hover:text-primary/80 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold hover:underline focus-visible:outline-hidden"
            >
              {isExpanded ? (
                <>
                  Show less
                  <ChevronUp className="size-3.5" />
                </>
              ) : (
                <>
                  Read more
                  <ChevronDown className="size-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Delivery Assurance */}
      <div className="border-border bg-muted/30 flex items-center gap-3 rounded-xl border p-4 text-sm">
        <Truck className="text-primary size-5 shrink-0" />
        <span className="text-muted-foreground text-xs sm:text-sm">
          Free delivery across Gujarat on orders above ₹5,000. Express repair pickup available in
          Ahmedabad.
        </span>
      </div>

      {/* Purchase Action Box */}
      <div className="flex flex-wrap items-center gap-3 pt-2 sm:gap-4">
        {/* Quantity Controls */}
        <div className="border-border bg-card flex items-center rounded-xl border shadow-2xs">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || !product.inStock}
            aria-label="Decrease quantity"
            className="cursor-pointer"
          >
            <Minus />
          </Button>
          <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setQuantity(quantity + 1)}
            disabled={!product.inStock}
            aria-label="Increase quantity"
            className="cursor-pointer"
          >
            <Plus />
          </Button>
        </div>

        {/* Add to Cart Button */}
        <Button
          size="lg"
          className="min-w-[140px] flex-1 cursor-pointer font-medium"
          disabled={!product.inStock || isAdding}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 size-4" />
          {isAdding ? "Adding..." : "Add to Cart"}
        </Button>

        {/* Wishlist Button */}
        <Button
          variant="outline"
          size="icon"
          disabled={isTogglingWishlist}
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "shrink-0 cursor-pointer transition-colors",
            isWishlisted && "text-destructive border-destructive/40 hover:text-destructive"
          )}
        >
          <Heart
            className={cn(
              "size-5 transition-transform duration-200",
              isWishlisted && "fill-destructive text-destructive scale-110"
            )}
          />
        </Button>

        {/* Share Button */}
        <Button
          variant="outline"
          size="icon"
          aria-label="Share"
          className="shrink-0 cursor-pointer"
          onClick={() => {
            if (navigator?.clipboard) {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Product link copied to clipboard");
            }
          }}
        >
          <Share2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
