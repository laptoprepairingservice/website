"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { Breadcrumb } from "@ui/shadcn/components/breadcrumb";
import { Button } from "@ui/shadcn/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/shadcn/components/card";
import { FormField } from "@ui/shadcn/components/form-field";
import { Input } from "@ui/shadcn/components/input";
import { Textarea } from "@ui/shadcn/components/textarea";
import { RadioGroup } from "@ui/shadcn/components/form-controls";
import { EmptyState } from "@ui/shadcn/components/empty-state";
import { formatPrice } from "@/lib/format";
import { STORE } from "@/lib/store-config";
import { useAppContext } from "@/app/_context";

export default function CheckoutPage() {
  const { user, cartItems, cartSubtotal, clearCart } = useAppContext();
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitted, setSubmitted] = useState(false);

  const shipping = cartSubtotal >= STORE.freeShippingThreshold ? 0 : STORE.standardShipping;
  const codFee = STORE.codFee;
  const total = cartSubtotal + shipping;
  const finalTotal = paymentMethod === "cod" ? total + codFee : total;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    await clearCart();
    toast.success("Order placed successfully!", {
      description: "You will receive a confirmation email shortly.",
    });
  };

  if (cartItems.length === 0 && !submitted) {
    return (
      <div className="py-8 lg:py-12">
        <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add items to your cart before proceeding to checkout."
          action={
            <Button asChild>
              <Link href="/">Browse Store</Link>
            </Button>
          }
          className="mt-8"
        />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-3xl font-bold">Order Received!</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you for shopping with Ranuja Enterprise. We are preparing your order.
        </p>
        <div className="mt-8 flex justify-center gap-4">
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

  return (
    <div className="py-8 lg:py-12">
      <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mt-6 text-3xl font-semibold">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField label="First Name" id="firstName">
                <Input id="firstName" required defaultValue={user?.first_name || ""} placeholder="Rahul" />
              </FormField>
              <FormField label="Last Name" id="lastName">
                <Input id="lastName" required defaultValue={user?.last_name || ""} placeholder="Shah" />
              </FormField>
              <FormField label="Email" id="email" className="sm:col-span-2">
                <Input id="email" type="email" required defaultValue={user?.email || ""} placeholder="rahul@example.com" />
              </FormField>
              <FormField label="Phone" id="phone" className="sm:col-span-2">
                <Input id="phone" type="tel" required defaultValue={user?.phone || ""} placeholder="+91 98765 43210" />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField label="Address Line 1" id="address1" className="sm:col-span-2">
                <Input id="address1" required placeholder="123, SG Highway" />
              </FormField>
              <FormField label="Address Line 2" id="address2" className="sm:col-span-2">
                <Input id="address2" placeholder="Near Iscon Cross Road" />
              </FormField>
              <FormField label="City" id="city">
                <Input id="city" required defaultValue="Ahmedabad" />
              </FormField>
              <FormField label="State" id="state">
                <Input id="state" required defaultValue="Gujarat" />
              </FormField>
              <FormField label="PIN Code" id="pincode">
                <Input id="pincode" required placeholder="380054" />
              </FormField>
              <FormField label="Landmark" id="landmark">
                <Input id="landmark" placeholder="Optional" />
              </FormField>
              <FormField label="Delivery Instructions" id="instructions" className="sm:col-span-2">
                <Textarea id="instructions" placeholder="Any special instructions for delivery" />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                name="delivery"
                value={deliveryMethod}
                onChange={setDeliveryMethod}
                options={[
                  {
                    value: "standard",
                    label: `Standard Delivery (3-5 business days) — ${shipping === 0 ? "Free" : formatPrice(shipping)}`,
                  },
                  { value: "express", label: "Express Delivery (1-2 business days) — ₹199" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                name="payment"
                value={paymentMethod}
                onChange={setPaymentMethod}
                options={[
                  { value: "cod", label: `Cash on Delivery (+${formatPrice(codFee)} fee)` },
                  { value: "upi", label: "UPI / Net Banking (Coming Soon)" },
                  { value: "card", label: "Credit / Debit Card (Coming Soon)" },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.variantId || item.id} className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground line-clamp-2">
                  {item.name} {item.quantity > 1 ? `× ${item.quantity}` : ""}
                </span>
                <span className="shrink-0 font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-border space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              {paymentMethod === "cod" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">COD Fee</span>
                  <span>{formatPrice(codFee)}</span>
                </div>
              )}
              <div className="border-border flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full">
              Place Order
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/cart">Back to Cart</Link>
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
