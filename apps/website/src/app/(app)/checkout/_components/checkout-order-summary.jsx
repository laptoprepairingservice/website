"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { STORE } from "@/lib/store-config";
import { useAppContext } from "@/app/_context";

// ─── QuantityStepper ──────────────────────────────────────────────────────────

function QuantityStepper({ item }) {
  const { updateQuantity, removeFromCart } = useAppContext();
  const [pending, setPending] = useState(false);

  const variantId = item.variantId || item.id;

  const handleDecrement = async () => {
    if (pending) return;
    setPending(true);
    if (item.quantity === 1) {
      await removeFromCart(variantId);
    } else {
      await updateQuantity(variantId, -1);
    }
    setPending(false);
  };

  const handleIncrement = async () => {
    if (pending) return;
    setPending(true);
    await updateQuantity(variantId, 1);
    setPending(false);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={pending}
        aria-label={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
        className={`flex size-6 items-center justify-center rounded-md border transition-colors disabled:opacity-40 ${
          item.quantity === 1
            ? "border-destructive/40 text-destructive hover:bg-destructive/10"
            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        } `}
      >
        {item.quantity === 1 ? (
          /* Inline trash icon — avoids extra import */
          <svg
            className="size-3"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <span className="text-sm leading-none font-bold">−</span>
        )}
      </button>

      <span className="text-foreground min-w-6 text-center text-sm font-semibold tabular-nums">
        {item.quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={pending}
        className="border-border text-muted-foreground hover:bg-muted hover:text-foreground flex size-6 items-center justify-center rounded-md border transition-colors disabled:opacity-40"
      >
        <span className="text-sm leading-none font-bold">+</span>
      </button>
    </div>
  );
}

// ─── CheckoutOrderSummary ────────────────────────────────────────────────────

/**
 * Sticky right-column order summary panel.
 *
 * @param {Array}   cartItems     - Normalized cart items from context
 * @param {number}  cartSubtotal  - Subtotal (sum of item prices)
 * @param {string}  deliveryMethod- 'standard' | 'express'
 */
export function CheckoutOrderSummary({
  cartItems = [],
  cartSubtotal = 0,
  deliveryMethod = "standard",
}) {
  const expressFee = 199;
  const standardShipping = cartSubtotal >= STORE.freeShippingThreshold ? 0 : STORE.standardShipping;
  const shipping = deliveryMethod === "express" ? expressFee : standardShipping;
  const total = cartSubtotal + shipping;

  return (
    <div className="border-border bg-card rounded-2xl border">
      {/* Header */}
      <div className="border-border border-b px-5 py-4">
        <h2 className="text-foreground font-semibold">Order Summary</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Items */}
      <div className="divide-border divide-y px-5">
        {cartItems.map((item) => (
          <div key={item.variantId || item.id} className="flex items-center gap-3 py-3.5">
            {/* Image */}
            <div className="border-border bg-muted/30 relative size-14 shrink-0 overflow-visible rounded-lg border">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  unoptimized
                  sizes="56px"
                  className="object-contain p-1"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Package className="text-muted-foreground/50 size-5" />
                </div>
              )}
            </div>

            {/* Name + stepper + price */}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="text-foreground line-clamp-1 text-sm font-medium">{item.name}</p>
              <div className="flex items-center justify-between gap-2">
                <QuantityStepper item={item} />
                <p className="text-foreground shrink-0 text-sm font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-border space-y-2.5 border-t px-5 py-4 text-sm">
        <div className="text-muted-foreground flex justify-between">
          <span>Subtotal</span>
          <span className="text-foreground">{formatPrice(cartSubtotal)}</span>
        </div>
        <div className="text-muted-foreground flex justify-between">
          <span>Shipping{deliveryMethod === "express" ? " (Express)" : ""}</span>
          <span className={shipping === 0 ? "font-medium text-emerald-600" : "text-foreground"}>
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>

        <div className="border-border text-foreground flex justify-between border-t pt-3 text-base font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        {cartSubtotal < STORE.freeShippingThreshold && deliveryMethod === "standard" && (
          <p className="text-muted-foreground text-xs">
            Add{" "}
            <span className="text-foreground font-medium">
              {formatPrice(STORE.freeShippingThreshold - cartSubtotal)}
            </span>{" "}
            more for free shipping
          </p>
        )}
      </div>
    </div>
  );
}
