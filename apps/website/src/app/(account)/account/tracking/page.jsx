"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderTimeline } from "@/components/store/order-timeline";

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [tracked, setTracked] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderId.trim()) setTracked(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Order Tracking</h1>
        <p className="mt-1 text-muted-foreground">Enter your order ID to track delivery status</p>
      </div>

      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleTrack} className="flex gap-3">
            <FormField label="Order ID" id="orderId" className="flex-1">
              <Input
                id="orderId"
                placeholder="e.g. CV-2026-00142"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </FormField>
            <Button type="submit" className="mt-auto shrink-0">
              <Search />
              Track
            </Button>
          </form>
        </CardContent>
      </Card>

      {tracked && (
        <Card>
          <CardHeader>
            <CardTitle>Order {orderId || "CV-2026-00138"}</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline currentStatus="shipped" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
