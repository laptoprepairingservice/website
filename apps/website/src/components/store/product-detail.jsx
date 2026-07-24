"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, Share2, ShoppingCart, Truck } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/store/product-card";
import { StarRating } from "@/components/store/star-rating";
import { formatDiscount, formatPrice } from "@/lib/format";
import { getRelatedProducts, PRODUCTS } from "@/lib/data/products";
import { cn } from "@/lib/utils";

export function ProductDetail({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState(0);
  const discount = formatDiscount(product.price, product.originalPrice);
  const related = getRelatedProducts(product);

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <div className="container-store py-8 lg:py-12">
      <Breadcrumb
        items={[
          { label: "Products", href: "/products" },
          { label: product.category.replace("-", " "), href: `/products?category=${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted/30 p-8">
            <Image
              src={product.images[activeImage] || product.image}
              alt={product.name}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative size-20 overflow-hidden rounded-xl border-2 bg-muted/30 p-2 transition-colors",
                    activeImage === i ? "border-primary" : "border-border"
                  )}
                >
                  <Image src={img} alt="" fill className="object-contain" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{product.brand}</p>
            <h1 className="mt-2 text-2xl font-semibold md:text-3xl">{product.name}</h1>
            <div className="mt-4">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                <Badge variant="discount">-{discount}%</Badge>
              </>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">SKU:</span> {product.sku}
            </p>
            <p>
              <span className="text-muted-foreground">Availability:</span>{" "}
              {product.inStock ? (
                <span className="font-medium text-success">In Stock ({product.stockCount} units)</span>
              ) : (
                <span className="font-medium text-destructive">Out of Stock</span>
              )}
            </p>
          </div>

          <p className="text-muted-foreground">{product.shortDescription}</p>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
            <Truck className="size-5 shrink-0 text-primary" />
            <span>Free delivery across Gujarat on orders above ₹5,000</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-xl border border-border">
              <Button variant="ghost" size="icon-sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">
                <Minus />
              </Button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <Button variant="ghost" size="icon-sm" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">
                <Plus />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              disabled={!product.inStock}
              onClick={() => toast.success("Added to cart", { description: product.name })}
            >
              <ShoppingCart />
              Add to Cart
            </Button>
            <Button variant="outline" size="icon" onClick={() => toast.success("Added to wishlist")} aria-label="Add to wishlist">
              <Heart />
            </Button>
            <Button variant="outline" size="icon" aria-label="Share">
              <Share2 />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="flex gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="py-8">
          {activeTab === "description" && (
            <div className="max-w-none text-muted-foreground">
              <p>{product.description}</p>
            </div>
          )}
          {activeTab === "specifications" && (
            <dl className="grid gap-4 sm:grid-cols-2">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between rounded-lg border border-border px-4 py-3">
                  <dt className="text-sm text-muted-foreground capitalize">{key.replace("-", " ")}</dt>
                  <dd className="text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-semibold">{product.rating}</span>
                <div>
                  <StarRating rating={product.rating} showCount={false} size="md" />
                  <p className="mt-1 text-sm text-muted-foreground">{product.reviewCount} reviews</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Customer reviews will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-border pt-16">
          <h2 className="mb-8 text-2xl font-semibold">Related Products</h2>
          <ProductGrid products={related} />
        </section>
      )}

      <section className="mt-16 border-t border-border pt-16">
        <h2 className="mb-8 text-2xl font-semibold">Recently Viewed</h2>
        <ProductGrid products={PRODUCTS.slice(0, 4)} />
      </section>
    </div>
  );
}
