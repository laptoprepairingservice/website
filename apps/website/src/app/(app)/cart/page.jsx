"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/format";
import { PRODUCTS } from "@/lib/data/products";
import { STORE } from "@/lib/store-config";

const CART_ITEMS = [
  { ...PRODUCTS[0], quantity: 1 },
  { ...PRODUCTS[3], quantity: 2 },
];

export default function CartPage() {
  const [items, setItems] = useState(CART_ITEMS);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= STORE.freeShippingThreshold ? 0 : STORE.standardShipping;
  const total = subtotal + shipping;

  const updateQuantity = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed from cart");
  };

  if (items.length === 0) {
    return (
      <div className="container-store py-12">
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
    <div className="container-store py-8 lg:py-12">
      <Breadcrumb items={[{ label: "Shopping Cart" }]} />
      <h1 className="mt-6 text-3xl font-semibold">Shopping Cart</h1>
      <p className="mt-1 text-muted-foreground">{items.length} items</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-xl border border-border bg-card p-4 sm:gap-6 sm:p-6">
              <Link href={`/products/${item.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted/30 sm:size-28">
                <Image src={item.image} alt={item.name} fill className="object-contain p-2" sizes="112px" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">{item.brand}</p>
                  <Link href={`/products/${item.slug}`} className="mt-1 block font-medium hover:text-primary">
                    {item.name}
                  </Link>
                  <p className="mt-2 font-semibold">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center rounded-lg border border-border">
                    <Button variant="ghost" size="icon-sm" onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease">
                      <Minus />
                    </Button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon-sm" onClick={() => updateQuantity(item.id, 1)} aria-label="Increase">
                      <Plus />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive">
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
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted-foreground">
                Add {formatPrice(STORE.freeShippingThreshold - subtotal)} more for free shipping
              </p>
            )}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between font-semibold">
                <span>Estimated Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Inclusive of GST</p>
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
