"use client";

import { CheckCircle2, AlertCircle, Loader2, Sparkles, Truck, Zap } from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { formatPrice } from "@/lib/format";
import { STORE } from "@/lib/store-config";

// ─── Delivery option card ─────────────────────────────────────────────────────

function DeliveryOptionCard({
  id,
  icon: Icon,
  title,
  courierName,
  estimatedDelivery,
  priceText,
  description,
  selected,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`
        flex w-full cursor-pointer items-start gap-4 rounded-xl border p-4 text-left transition-all duration-150
        ${
          selected
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-foreground text-sm sm:text-base">{title}</p>
          <span className="font-bold text-sm sm:text-base text-foreground shrink-0">
            {priceText}
          </span>
        </div>

        {courierName && (
          <p className="mt-0.5 text-xs font-medium text-foreground/80 flex items-center gap-1.5">
            <span>Via {courierName}</span>
            {estimatedDelivery && (
              <span className="text-muted-foreground">• Est: {estimatedDelivery}</span>
            )}
          </p>
        )}

        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
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
 * Shiprocket-powered delivery method selector.
 * Dynamically computes rates, courier partners, and ETDs based on delivery PIN code.
 */
export function CheckoutDeliverySection({
  deliveryMethod,
  onDeliveryChange,
  cartSubtotal = 0,
  shippingData = null,
  checkingShipping = false,
  shippingError = null,
  selectedAddress = null,
}) {
  const pincode = selectedAddress?.postal_code || selectedAddress?.pincode;

  // If no address selected
  if (!selectedAddress) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 p-6 text-center">
        <Truck className="mx-auto size-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm font-medium text-foreground">Select a delivery address</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Choose an address in Step 1 to verify courier serviceability and calculate live shipping rates.
        </p>
      </div>
    );
  }

  // Loading state
  if (checkingShipping) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-6 text-center space-y-2">
        <Loader2 className="mx-auto size-6 text-primary animate-spin" />
        <p className="text-sm font-semibold text-foreground">
          Checking Courier Serviceability...
        </p>
        <p className="text-xs text-muted-foreground">
          Verifying delivery routes and real-time shipping rates for PIN code {pincode} via Shiprocket.
        </p>
      </div>
    );
  }

  // Unserviceable error state
  if (shippingError || (shippingData && !shippingData.serviceable)) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-destructive">
              Delivery Unavailable to PIN Code {pincode}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {shippingError ||
                shippingData?.reason ||
                "Our courier partners are currently unable to service this postal code. Please select or add an alternate delivery address to proceed."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Live Shiprocket calculated rates
  const cheapest = shippingData?.cheapestOption;
  const fastest = shippingData?.fastestOption;

  const standardRate = shippingData?.standardRate ?? STORE.standardShipping;
  const expressRate = shippingData?.expressRate ?? 199;

  const isFreeStandard = cartSubtotal >= STORE.freeShippingThreshold;
  const standardPriceText = isFreeStandard ? "Free" : formatPrice(standardRate);
  const expressPriceText = formatPrice(expressRate);

  const standardETD = cheapest?.estimatedDelivery || "3–5 business days";
  const expressETD = fastest?.estimatedDelivery || "1–2 business days";

  return (
    <div className="space-y-3">
      {/* Shiprocket Serviceability Verified Banner */}
      {shippingData?.serviceable && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">
              Delivery available to {pincode}
            </span>
            <span className="text-emerald-700/80 dark:text-emerald-400/80">
              ({shippingData.shippingOptions?.length || 1} courier {shippingData.shippingOptions?.length === 1 ? "partner" : "partners"})
            </span>
          </div>
          {shippingData.weightKg && (
            <Badge variant="outline" className="border-emerald-500/30 bg-background/50 text-[10px]">
              Est. Weight: {shippingData.weightKg} kg
            </Badge>
          )}
        </div>
      )}

      {/* Standard Shipping Card */}
      <DeliveryOptionCard
        id="standard"
        icon={Truck}
        title="Standard Ground Delivery"
        courierName={cheapest?.courierName || "Surface Courier"}
        estimatedDelivery={standardETD}
        priceText={standardPriceText}
        description={
          isFreeStandard
            ? "Free standard shipping on orders over ₹999!"
            : `Add ${formatPrice(STORE.freeShippingThreshold - cartSubtotal)} more for Free Shipping`
        }
        selected={deliveryMethod === "standard"}
        onSelect={onDeliveryChange}
      />

      {/* Express Shipping Card */}
      <DeliveryOptionCard
        id="express"
        icon={Zap}
        title="Express Air Priority"
        courierName={fastest?.courierName || "Air Priority Courier"}
        estimatedDelivery={expressETD}
        priceText={expressPriceText}
        description="Fastest dispatch with guaranteed priority flight connection"
        selected={deliveryMethod === "express"}
        onSelect={onDeliveryChange}
      />

      <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Sparkles className="size-3 text-primary" />
          Live rates & tracking powered by Shiprocket
        </span>
        {pincode && <span>Dispatch from {shippingData?.pickupPostcode || "380015"}</span>}
      </div>
    </div>
  );
}
