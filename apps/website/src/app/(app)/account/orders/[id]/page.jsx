import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/shadcn/components/card";
import { Badge } from "@ui/shadcn/components/badge";
import { EmptyState } from "@ui/shadcn/components/empty-state";
import { OrderTimeline } from "@/components/store/order-timeline";
import { formatPrice } from "@/lib/format";
import { getOrderById } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/account/orders">
            <ArrowLeft className="size-4" />
            Back to Orders
          </Link>
        </Button>
        <EmptyState
          icon={Package}
          title="Order Not Found"
          description={`We couldn't find order "${id}". Please check your order ID and try again.`}
          action={
            <Button asChild>
              <Link href="/account/orders">View All Orders</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const items = order.order_items || [];
  const address = order.shipping_address || {};

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/account/orders">
            <ArrowLeft className="size-4" />
            Back to Orders
          </Link>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">
              {order.order_number || `Order #${order.id}`}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Placed on{" "}
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <Badge variant={order.status === "delivered" ? "success" : "secondary"}>
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline currentStatus={order.status?.toLowerCase() || "processing"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} · {formatPrice(item.unit_price)} each
                    </p>
                  </div>
                  <p className="font-semibold shrink-0">{formatPrice(item.subtotal)}</p>
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
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {Number(order.shipping_amount) === 0
                    ? "Free"
                    : formatPrice(order.shipping_amount)}
                </span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {address && (address.full_name || address.address_line1) && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {address.full_name && (
                  <p className="font-medium text-foreground">{address.full_name}</p>
                )}
                {address.address_line1 && <p className="mt-1">{address.address_line1}</p>}
                {address.address_line2 && <p>{address.address_line2}</p>}
                {(address.city || address.state || address.postal_code) && (
                  <p>
                    {[address.city, address.state].filter(Boolean).join(", ")}
                    {address.postal_code ? ` — ${address.postal_code}` : ""}
                  </p>
                )}
                {address.phone && <p className="mt-2">{address.phone}</p>}
              </CardContent>
            </Card>
          )}

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
