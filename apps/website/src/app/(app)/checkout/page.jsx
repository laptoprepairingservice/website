"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { Breadcrumb } from "@ui/shadcn/components/breadcrumb";
import { useAppContext } from "@/app/_context";
import { formatPrice } from "@/lib/format";
import { STORE } from "@/lib/store-config";
import { getAddressesAction } from "@/app/(app)/account/addresses/_actions/get-addresses-action";

import { AddressList } from "@/components/address/address-list";
import { CheckoutOrderSummary } from "./_components/checkout-order-summary";
import { CheckoutDeliverySection } from "./_components/checkout-payment-section";
import { CheckoutEmpty, CheckoutSuccess } from "./_components/checkout-states";

// ─── Razorpay SDK loader ──────────────────────────────────────────────────────

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function SectionCard({ step, title, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {step}
        </div>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── CheckoutPage ─────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { user, cartItems, cartSubtotal, clearCart } = useAppContext();

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Fetch addresses via server action on mount
  useEffect(() => {
    getAddressesAction().then((addrs) => {
      setAddresses(addrs);
      const defaultAddr = addrs.find((a) => a.is_default) || addrs[0] || null;
      setSelectedAddress(defaultAddr);
    });
  }, []);

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [submitted, setSubmitted] = useState(false);
  const [placing, setPlacing] = useState(false);

  // Shiprocket live shipping state
  const [shippingData, setShippingData] = useState(null);
  const [checkingShipping, setCheckingShipping] = useState(false);
  const [shippingError, setShippingError] = useState(null);

  const deliveryPincode = selectedAddress?.postal_code || selectedAddress?.pincode;

  // Real-time Shiprocket serviceability & shipping rate check
  useEffect(() => {
    const cleanPincode = String(deliveryPincode || "").trim();
    if (!cleanPincode || !/^\d{6}$/.test(cleanPincode)) {
      return;
    }

    let isCancelled = false;

    async function checkRates() {
      setCheckingShipping(true);
      setShippingError(null);

      try {
        const res = await fetch("/api/checkout/shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deliveryPostcode: cleanPincode,
            cartItems,
            cartSubtotal,
          }),
        });

        const data = await res.json();
        if (isCancelled) return;

        if (data?.success && data?.serviceable) {
          setShippingData(data);
          setShippingError(null);
        } else {
          setShippingData(null);
          setShippingError(
            data?.reason || data?.message || "Delivery is unavailable to this PIN code."
          );
        }
      } catch (err) {
        if (isCancelled) return;
        console.error("Shipping serviceability check failed:", err);
        setShippingError("Unable to calculate shipping rates at this time.");
      } finally {
        if (!isCancelled) {
          setCheckingShipping(false);
        }
      }
    }

    checkRates();

    return () => {
      isCancelled = true;
    };
  }, [deliveryPincode, cartItems, cartSubtotal]);

  const cleanPincode = String(deliveryPincode || "").trim();
  const isPincodeValid = /^\d{6}$/.test(cleanPincode);
  const effectiveShippingData = isPincodeValid ? shippingData : null;
  const effectiveShippingError = isPincodeValid ? shippingError : null;

  // Computed shipping fees based on live Shiprocket rates & store free-shipping policy
  const activeCourier =
    deliveryMethod === "express"
      ? effectiveShippingData?.fastestOption
      : effectiveShippingData?.cheapestOption;

  const standardRate = effectiveShippingData?.standardRate ?? STORE.standardShipping;
  const expressRate = effectiveShippingData?.expressRate ?? 199;

  const standardShipping =
    cartSubtotal >= STORE.freeShippingThreshold ? 0 : standardRate;
  const shipping = deliveryMethod === "express" ? expressRate : standardShipping;
  const finalTotal = cartSubtotal + shipping;

  const isDeliveryDisabled =
    !selectedAddress ||
    checkingShipping ||
    Boolean(shippingError) ||
    (shippingData && !shippingData.serviceable);

  // ── Razorpay flow ─────────────────────────────────────────────────────────

  const handleRazorpayOrder = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Could not load payment gateway. Check your connection.");
      return false;
    }

    // 1. Create Razorpay order server-side
    const createRes = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount_paise: Math.round(finalTotal * 100),
        receipt: `rcpt_${Date.now()}`,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      toast.error(err.error || "Failed to initiate payment.");
      return false;
    }

    const { order_id, amount, currency, key } = await createRes.json();

    // 2. Open Razorpay checkout popup
    return new Promise((resolve) => {
      const options = {
        key,
        amount,
        currency,
        order_id,
        name: STORE.name,
        description: `Order from ${STORE.name}`,
        prefill: {
          name: user?.name || selectedAddress?.full_name || "",
          email: user?.email || "",
          contact: user?.phone || selectedAddress?.phone || "",
        },
        theme: { color: "#4f46e5" },
        handler: async (response) => {
          // 3. Verify signature + create DB order
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderPayload: {
                address: selectedAddress,
                cartItems,
                shipping,
                subtotal: cartSubtotal,
                courier: activeCourier
                  ? {
                      courierCompanyId: activeCourier.courierCompanyId,
                      courierName: activeCourier.courierName,
                      etd: activeCourier.etd,
                      rate: activeCourier.rate,
                    }
                  : null,
                shippingWeightKg: shippingData?.packageDetails?.totalWeightKg || null,
              },
            }),
          });

          if (!verifyRes.ok) {
            const err = await verifyRes.json();
            toast.error(err.error || "Payment verification failed. Contact support.");
            resolve(false);
            return;
          }

          resolve(true);
        },
        modal: {
          ondismiss: () => resolve(false),
        },
      };

      new window.Razorpay(options).open();
    });
  };

  // ── Main submit handler ────────────────────────────────────────────────────

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select or add a delivery address.");
      return;
    }

    if (checkingShipping) {
      toast.error("Please wait while we calculate shipping rates for your address.");
      return;
    }

    if (effectiveShippingError || (effectiveShippingData && !effectiveShippingData.serviceable)) {
      toast.error(
        effectiveShippingError || "Delivery is unavailable to this address. Please choose another address."
      );
      return;
    }

    setPlacing(true);

    try {
      const success = await handleRazorpayOrder();

      if (success) {
        await clearCart();
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Order placement error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // ── Render states ─────────────────────────────────────────────────────────

  if (cartItems.length === 0 && !submitted) {
    return (
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <CheckoutEmpty />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <CheckoutSuccess />
      </div>
    );
  }

  // ── Main checkout layout ───────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <Breadcrumb
        items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]}
      />

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Checkout</h1>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Link href="/cart">
            <ArrowLeft className="size-4" />
            Back to Cart
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Left: Steps ── */}
        <div className="space-y-5">
          {/* Step 1: Delivery Address */}
          <SectionCard step={1} title="Delivery Address">
            <AddressList
              addresses={addresses}
              selectable
              selectedId={selectedAddress?.public_id}
              onSelect={setSelectedAddress}
              showActions={false}
              onMutated={() =>
                getAddressesAction().then((addrs) => {
                  setAddresses(addrs);
                  if (!selectedAddress) {
                    setSelectedAddress(addrs.find((a) => a.is_default) || addrs[0] || null);
                  }
                })
              }
            />
            {!selectedAddress && addresses.length > 0 && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Please select a delivery address to continue.
              </p>
            )}
          </SectionCard>

          {/* Step 2: Delivery Method */}
          <SectionCard step={2} title="Delivery Method">
            <CheckoutDeliverySection
              deliveryMethod={deliveryMethod}
              onDeliveryChange={setDeliveryMethod}
              cartSubtotal={cartSubtotal}
              shippingData={effectiveShippingData}
              checkingShipping={checkingShipping}
              shippingError={effectiveShippingError}
              selectedAddress={selectedAddress}
            />
          </SectionCard>
        </div>

        {/* ── Right: Summary + CTA ── */}
        <div className="flex flex-col gap-4">
          <CheckoutOrderSummary
            cartItems={cartItems}
            cartSubtotal={cartSubtotal}
            deliveryMethod={deliveryMethod}
            shippingFee={shipping}
            shippingCourierName={activeCourier?.courierName}
          />

          {/* Pay button */}
          <Button
            size="lg"
            className="w-full gap-2 text-base font-semibold"
            onClick={handlePlaceOrder}
            disabled={
              placing ||
              !selectedAddress ||
              checkingShipping ||
              Boolean(effectiveShippingError || (effectiveShippingData && !effectiveShippingData.serviceable))
            }
          >
            <Lock className="size-4" />
            {placing
              ? "Processing..."
              : checkingShipping
              ? "Calculating shipping..."
              : `Pay ${formatPrice(finalTotal)}`}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Secure payments powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}
