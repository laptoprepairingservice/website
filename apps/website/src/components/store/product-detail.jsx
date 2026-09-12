"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Minus, Package, Plus, Share2, ShoppingCart, Truck } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb } from "@ui/shadcn/components/breadcrumb";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { ProductGrid } from "@/components/store/product-card";
import { StarRating } from "@/components/store/star-rating";
import { formatDiscount, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/app/_context";

export function ProductDetail({ product, relatedProducts = [] }) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useAppContext();

  const discount = formatDiscount(product.price, product.originalPrice);

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image
    ? [product.image]
    : [];

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: "Reviews" },
  ];

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
    <div className="py-8 lg:py-12">
      <Breadcrumb
        items={[
          { label: "Products", href: "/products" },
          {
            label: (product.categoryName || product.category || "Hardware").replace("-", " "),
            href: `/products?category=${product.category}`,
          },
          { label: product.name },
        ]}
      />

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="border-border bg-muted/30 relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border p-8">
            {images[activeImage] ? (
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                unoptimized
                className="object-contain p-6 transition-all"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <Package className="size-24 text-muted-foreground/30" />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "bg-muted/30 relative size-20 shrink-0 overflow-hidden rounded-xl border-2 p-2 transition-colors cursor-pointer",
                    activeImage === i ? "border-primary" : "border-border"
                  )}
                >
                  <Image src={img} alt="" fill unoptimized className="object-contain p-1" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
              {product.brand}
            </p>
            <h1 className="mt-2 text-2xl font-semibold md:text-3xl">{product.name}</h1>
            <div className="mt-4">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-muted-foreground text-lg line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <Badge variant="discount">-{discount}%</Badge>
              </>
            )}
          </div>

          <div className="space-y-2 text-sm">
            {product.sku && (
              <p>
                <span className="text-muted-foreground">SKU:</span> {product.sku}
              </p>
            )}
            <p>
              <span className="text-muted-foreground">Availability:</span>{" "}
              {product.inStock ? (
                <span className="text-success font-medium">In Stock</span>
              ) : (
                <span className="text-destructive font-medium">Out of Stock</span>
              )}
            </p>
          </div>

          {product.shortDescription && (
            <p className="text-muted-foreground">{product.shortDescription}</p>
          )}

          <div className="border-border bg-muted/30 flex items-center gap-2 rounded-xl border p-4 text-sm">
            <Truck className="text-primary size-5 shrink-0" />
            <span>Free delivery across Gujarat on orders above ₹5,000</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="border-border flex items-center rounded-xl border">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <Minus />
              </Button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-1 cursor-pointer"
              disabled={!product.inStock || isAdding}
              onClick={handleAddToCart}
            >
              <ShoppingCart />
              {isAdding ? "Adding..." : "Add to Cart"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => toast.success("Saved to wishlist", { description: product.name })}
              aria-label="Add to wishlist"
              className="cursor-pointer"
            >
              <Heart />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Share"
              className="cursor-pointer"
              onClick={() => {
                if (navigator?.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Product link copied to clipboard");
                }
              }}
            >
              <Share2 />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="border-border flex gap-1 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-colors cursor-pointer",
                activeTab === tab.id
                  ? "border-primary text-foreground border-b-2"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="py-8">
          {activeTab === "description" && (
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p>{product.description || product.shortDescription || "No description provided."}</p>
            </div>
          )}
          {activeTab === "specifications" && (
            <dl className="grid gap-4 sm:grid-cols-2">
              {Object.entries(product.specs || {}).length > 0 ? (
                Object.entries(product.specs).map(([key, value]) => (
                  <div
                    key={key}
                    className="border-border flex justify-between rounded-lg border px-4 py-3"
                  >
                    <dt className="text-muted-foreground text-sm capitalize">
                      {key.replace("-", " ")}
                    </dt>
                    <dd className="text-sm font-medium">{String(value)}</dd>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Specifications will be updated shortly.</p>
              )}
            </dl>
          )}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-semibold">{product.rating}</span>
                <div>
                  <StarRating rating={product.rating} showCount={false} size="md" />
                  <p className="text-muted-foreground mt-1 text-sm">
                    {product.reviewCount} reviews
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">Customer reviews will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="border-border mt-16 border-t pt-16">
          <h2 className="mb-8 text-2xl font-semibold">Related Products</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
