"use client";

import { formatPrice } from "@/lib/format";
import { STORE } from "@/lib/store-config";

// ─── Delivery option card ─────────────────────────────────────────────────────

function DeliveryOptionCard({ id, icon: Icon, title, description, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`
        flex w-full cursor-pointer items-start gap-4 rounded-xl border p-4 text-left transition-all duration-150
        ${selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
        }
      `}
    >
      {/* Icon */}
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
          selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="size-5" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Radio indicator */}
      <div
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          selected ? "border-primary bg-primary" : "border-border"
        }`}
      >
        {selected && <div className="size-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}

// ─── CheckoutDeliverySection ──────────────────────────────────────────────────

/**
 * Delivery method selector (Standard / Express).
 *
 * @param {string}   deliveryMethod   - 'standard' | 'express'
 * @param {Function} onDeliveryChange - Setter for deliveryMethod
 * @param {number}   cartSubtotal     - Used to compute shipping display
 */
export function CheckoutDeliverySection({
  deliveryMethod,
  onDeliveryChange,
  cartSubtotal = 0,
}) {
  const standardShipping =
    cartSubtotal >= STORE.freeShippingThreshold ? 0 : STORE.standardShipping;

  return (
    <div className="space-y-2.5">
      <DeliveryOptionCard
        id="standard"
        icon={({ className }) => (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            <path d="M12 12v4" />
            <path d="M8 14h8" />
          </svg>
        )}
        title={`Standard Delivery (3–5 business days) — ${standardShipping === 0 ? "Free" : formatPrice(standardShipping)}`}
        description={
          standardShipping === 0
            ? "You qualify for free shipping!"
            : `Free on orders above ${formatPrice(STORE.freeShippingThreshold)}`
        }
        selected={deliveryMethod === "standard"}
        onSelect={onDeliveryChange}
      />
      <DeliveryOptionCard
        id="express"
        icon={({ className }) => (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        )}
        title="Express Delivery (1–2 business days) — ₹199"
        selected={deliveryMethod === "express"}
        onSelect={onDeliveryChange}
      />
    </div>
  );
}
