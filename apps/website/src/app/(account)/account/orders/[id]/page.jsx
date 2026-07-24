import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderTimeline } from "@/components/store/order-timeline";
import { formatPrice } from "@/lib/format";
import { PRODUCTS } from "@/lib/data/products";
import { STORE } from "@/lib/store-config";

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  const items = [PRODUCTS[0], PRODUCTS[3]];
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const shipping = 0;

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/account/orders">
            <ArrowLeft />
            Back to Orders
          </Link>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">Order {id}</h1>
            <p className="mt-1 text-muted-foreground">Placed on Jan 18, 2026</p>
          </div>
          <Badge variant="success">Delivered</Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline currentStatus="delivered" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted/30">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="64px" />
                  </div>
                  <div className="flex-1">
                    <Link href={`/products/${item.slug}`} className="font-medium hover:text-primary">
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">Qty: 1</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <span>Total</span>
                <span>{formatPrice(subtotal + shipping)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Rahul Shah</p>
              <p className="mt-1">123, SG Highway, Near Iscon Cross Road</p>
              <p>Ahmedabad, Gujarat — 380054</p>
              <p className="mt-2">+91 98765 43210</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>Cash on Delivery</p>
              <p className="text-muted-foreground">Paid on delivery</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Order ${id}` };
}
