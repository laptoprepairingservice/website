"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb } from "@ui/shadcn/components/breadcrumb";
import { Button } from "@ui/shadcn/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/shadcn/components/card";
import { EmptyState } from "@ui/shadcn/components/empty-state";
import { formatPrice } from "@/lib/format";
import { STORE } from "@/lib/store-config";
import { useAppContext } from "@/app/_context";

export default function CartPage() {
  const { cartItems, cartCount, updateQuantity, removeFromCart, cartSubtotal } = useAppContext();

  const shipping =
    cartSubtotal >= STORE.freeShippingThreshold
      ? 0
      : cartItems.length > 0
      ? STORE.standardShipping
      : 0;
  const total = cartSubtotal + shipping;

  const handleRemove = (id) => {
    removeFromCart(id);
    toast.success("Item removed from cart");
  };

  if (cartItems.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse our products and add items to your cart."
          action={
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="py-8 lg:py-12">
      <Breadcrumb items={[{ label: "Shopping Cart" }]} />
      <h1 className="mt-6 text-3xl font-semibold">Shopping Cart</h1>
      <p className="text-muted-foreground mt-1">
        {cartCount} {cartCount === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cartItems.map((item) => (
            <div
              key={item.variantId}
              className="border-border bg-card flex gap-4 rounded-xl border p-4 sm:gap-6 sm:p-6"
            >
              <Link
                href={`/products/${item.slug}`}
                className="bg-muted/30 relative size-24 shrink-0 overflow-hidden rounded-lg sm:size-28"
              >
                <Image
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&h=800&fit=crop"
                  }
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-contain p-2"
                  sizes="112px"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    {item.brand}
                  </p>
                  <Link
                    href={`/products/${item.slug}`}
                    className="hover:text-primary mt-1 block font-medium"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-2 font-semibold">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="border-border flex items-center rounded-lg border">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => updateQuantity(item.variantId, -1)}
                      aria-label="Decrease"
                    >
                      <Minus />
                    </Button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => updateQuantity(item.variantId, 1)}
                      aria-label="Increase"
                    >
                      <Plus />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(item.variantId)}
                    className="text-destructive hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-muted-foreground text-xs">
                Add {formatPrice(STORE.freeShippingThreshold - cartSubtotal)} more for free shipping
              </p>
            )}
            <div className="border-border border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Estimated Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">Inclusive of GST</p>
            </div>
            <Button size="lg" className="w-full" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
