"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, Input, Textarea } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/form-controls";
import { formatPrice } from "@/lib/format";
import { PRODUCTS } from "@/lib/data/products";
import { STORE } from "@/lib/store-config";

const ORDER_ITEMS = [PRODUCTS[0], PRODUCTS[3]];
const subtotal = ORDER_ITEMS.reduce((s, i) => s + i.price, 0);
const shipping = subtotal >= STORE.freeShippingThreshold ? 0 : STORE.standardShipping;
const codFee = STORE.codFee;
const total = subtotal + shipping;

export default function CheckoutPage() {
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const finalTotal = paymentMethod === "cod" ? total + codFee : total;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    toast.success("Order placed successfully!", { description: "You will receive a confirmation email shortly." });
  };

  return (
    <div className="container-store py-8 lg:py-12">
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
                <Input id="firstName" required placeholder="Rahul" />
              </FormField>
              <FormField label="Last Name" id="lastName">
                <Input id="lastName" required placeholder="Shah" />
              </FormField>
              <FormField label="Email" id="email" className="sm:col-span-2">
                <Input id="email" type="email" required placeholder="rahul@example.com" />
              </FormField>
              <FormField label="Phone" id="phone" className="sm:col-span-2">
                <Input id="phone" type="tel" required placeholder="+91 98765 43210" />
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
                  { value: "standard", label: `Standard Delivery (3-5 business days) — ${shipping === 0 ? "Free" : formatPrice(shipping)}` },
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
            {ORDER_ITEMS.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="line-clamp-2 text-muted-foreground">{item.name}</span>
                <span className="shrink-0 font-medium">{formatPrice(item.price)}</span>
              </div>
            ))}
            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
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
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
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
