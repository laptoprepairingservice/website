"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";

export function CheckoutEmpty() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <ShoppingBag className="size-9 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground">
          Add items to your cart before proceeding to checkout.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/">Browse Store</Link>
      </Button>
    </div>
  );
}

export function CheckoutSuccess() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      {/* Animated checkmark */}
      <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <svg
          className="size-10 text-emerald-600 dark:text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold text-foreground">Order Placed!</h1>
        <p className="text-muted-foreground">
          Thank you for shopping with Ranuja Enterprise.
          <br />
          We are preparing your order.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account/orders">View Orders</Link>
        </Button>
      </div>
    </div>
  );
}
