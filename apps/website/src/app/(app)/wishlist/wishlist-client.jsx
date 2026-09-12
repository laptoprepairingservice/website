"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@ui/shadcn/components/button";
import { EmptyState } from "@ui/shadcn/components/empty-state";
import { ProductGrid } from "@/components/store/product-card";
import { useAppContext } from "@/app/_context";

export function WishlistClient({ isAccountView = false }) {
  const {
    isAuthenticated,
    wishlistItems,
    wishlistCount,
    clearWishlist,
    addToCart,
  } = useAppContext();

  const [isAddingAll, setIsAddingAll] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleAddAllToCart = async () => {
    if (isAddingAll || wishlistItems.length === 0) return;

    setIsAddingAll(true);
    try {
      let addedCount = 0;
      for (const item of wishlistItems) {
        if (item.inStock !== false) {
          await addToCart(item, 1);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        toast.success(`Added ${addedCount} items to your cart`, {
          action: {
            label: "View Cart",
            onClick: () => {
              window.location.href = "/cart";
            },
          },
        });
      } else {
        toast.info("No in-stock items found to add to cart");
      }
    } catch (err) {
      console.error("Failed to add all items to cart:", err);
      toast.error("Failed to add items to cart");
    } finally {
      setIsAddingAll(false);
    }
  };

  const handleClearWishlist = async () => {
    if (isClearing || wishlistItems.length === 0) return;

    setIsClearing(true);
    try {
      await clearWishlist();
      toast.success("Wishlist cleared");
    } catch (err) {
      console.error("Failed to clear wishlist:", err);
      toast.error("Failed to clear wishlist");
    } finally {
      setIsClearing(false);
    }
  };

  // 1. Unauthenticated View
  if (!isAuthenticated) {
    const nextPath = isAccountView ? "/account/wishlist" : "/wishlist";
    return (
      <div className="py-12">
        <EmptyState
          icon={Heart}
          title="Sign in to view your wishlist"
          description="Your wishlist is stored securely with your account. Sign in to access your saved hardware components and price tracking."
          action={
            <Button asChild>
              <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>
                Sign In
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  // 2. Empty Wishlist View
  if (wishlistItems.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save hardware components you're interested in by clicking the heart icon on any product."
          action={
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          }
        />
      </div>
    );
  }

  // 3. Authenticated Wishlist View
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1
            className={
              isAccountView
                ? "text-2xl font-semibold md:text-3xl"
                : "text-3xl font-semibold"
            }
          >
            Wishlist
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {wishlistCount} {wishlistCount === 1 ? "item" : "items"} saved
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddAllToCart}
            disabled={isAddingAll}
            className="cursor-pointer"
          >
            <ShoppingBag className="mr-1.5 size-4" />
            {isAddingAll ? "Adding..." : "Add All to Cart"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearWishlist}
            disabled={isClearing}
            className="text-muted-foreground hover:text-destructive cursor-pointer"
          >
            <Trash2 className="mr-1.5 size-4" />
            {isClearing ? "Clearing..." : "Clear"}
          </Button>
        </div>
      </div>

      <div className="pt-2">
        <ProductGrid products={wishlistItems} />
      </div>
    </div>
  );
}
