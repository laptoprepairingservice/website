import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Clock,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/shadcn/components/card";
import { Separator } from "@ui/shadcn/components/separator";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: "Pending",
    badgeVariant: "warning",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    step: 0,
  },
  confirmed: {
    icon: CircleDot,
    label: "Confirmed",
    badgeVariant: "secondary",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    step: 1,
  },
  processing: {
    icon: CircleDot,
    label: "Processing",
    badgeVariant: "warning",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    step: 2,
  },
  shipped: {
    icon: Truck,
    label: "Shipped",
    badgeVariant: "secondary",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    step: 3,
  },
  delivered: {
    icon: CheckCircle2,
    label: "Delivered",
    badgeVariant: "success",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    step: 4,
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    badgeVariant: "destructive",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    step: -1,
  },
};

const TIMELINE_STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function getConfig(status) {
  return (
    STATUS_CONFIG[status?.toLowerCase()] ?? {
      icon: Package,
      label: status || "Unknown",
      badgeVariant: "secondary",
      color: "text-muted-foreground",
      bg: "bg-muted",
      step: 0,
    }
  );
}

function formatDate(dateStr, opts = {}) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  });
}

/* -------------------------------------------------------------------------- */
/* Data fetch                                                                  */
/* -------------------------------------------------------------------------- */

async function getOrder(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      subtotal,
      shipping_amount,
      discount_amount,
      tax_amount,
      total_amount,
      shipping_address,
      customer_note,
      payment_method,
      payment_id,
      payment_status,
      created_at,
      updated_at,
      user_id,
      order_items (
        id,
        variant_id,
        product_name,
        sku,
        unit_price,
        quantity,
        subtotal
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
  return data;
}

/* -------------------------------------------------------------------------- */
/* Components                                                                  */
/* -------------------------------------------------------------------------- */

function OrderTimeline({ status }) {
  const isCancelled = status?.toLowerCase() === "cancelled";
  const currentConfig = getConfig(status);
  const currentStep = currentConfig.step;

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-rose-500/10 p-4">
        <XCircle className="size-5 shrink-0 text-rose-500" />
        <div>
          <p className="font-medium text-rose-600 dark:text-rose-400">Order Cancelled</p>
          <p className="text-muted-foreground text-xs">This order has been cancelled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-0">
      {TIMELINE_STEPS.map((step, idx) => {
        const stepConfig = STATUS_CONFIG[step.key];
        const StepIcon = stepConfig.icon;
        const isDone = currentStep > idx;
        const isCurrent = currentStep === idx;
        const isLast = idx === TIMELINE_STEPS.length - 1;

        return (
          <div key={step.key} className="flex flex-1 flex-col items-center">
            {/* connector + icon row */}
            <div className="flex w-full items-center">
              {/* left connector */}
              <div
                className={`h-0.5 flex-1 ${idx === 0 ? "invisible" : isDone || isCurrent ? "bg-primary" : "bg-border"}`}
              />
              {/* icon circle */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <StepIcon className="size-3.5" />
                )}
              </div>
              {/* right connector */}
              <div
                className={`h-0.5 flex-1 ${isLast ? "invisible" : isDone ? "bg-primary" : "bg-border"}`}
              />
            </div>
            {/* label */}
            <p
              className={`mt-2 text-center text-[10px] font-medium leading-tight ${
                isCurrent ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-md">
          <Icon className="text-muted-foreground size-3.5" />
        </div>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  const config = getConfig(order.status);
  const StatusIcon = config.icon;
  const addr = order.shipping_address || {};
  const items = order.order_items || [];
  const isCancelled = order.status?.toLowerCase() === "cancelled";
  const isPaid = order.payment_status === "paid";

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
            <Link href="/orders">
              <ArrowLeft className="mr-1.5 size-4" />
              All Orders
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">
              {order.order_number || `Order #${order.id}`}
            </h1>
            <Badge variant={config.badgeVariant} className="capitalize">
              {config.label}
            </Badge>
            <Badge variant={isPaid ? "success" : "outline"} className="text-xs capitalize">
              {order.payment_status || "cod"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Placed on {formatDate(order.created_at, { hour: "2-digit", minute: "2-digit" })}
            {order.updated_at && order.updated_at !== order.created_at && (
              <> · Updated {formatDate(order.updated_at)}</>
            )}
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex shrink-0 gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg}`}
          >
            <StatusIcon className={`size-5 ${config.color}`} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Order Progress</CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          <OrderTimeline status={order.status} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: items + note */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order items */}
          <SectionCard icon={ShoppingBag} title={`Items (${items.length})`}>
            <div className="divide-border divide-y">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {item.product_name}
                    </p>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      {item.sku && <span className="font-mono">{item.sku}</span>}
                      <span>
                        Qty: {item.quantity} × {formatPrice(item.unit_price)}
                      </span>
                    </div>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Customer note */}
          {order.customer_note && (
            <SectionCard icon={Package} title="Customer Note">
              <p className="text-muted-foreground text-sm italic">
                &ldquo;{order.customer_note}&rdquo;
              </p>
            </SectionCard>
          )}
        </div>

        {/* Right: summary + address + payment */}
        <div className="space-y-6">
          {/* Order summary */}
          <SectionCard icon={CreditCard} title="Order Summary">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="tabular-nums">
                  {Number(order.shipping_amount) === 0
                    ? "Free"
                    : formatPrice(order.shipping_amount)}
                </span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span className="tabular-nums">−{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              {Number(order.tax_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="tabular-nums">{formatPrice(order.tax_amount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </SectionCard>

          {/* Shipping address */}
          {(addr.full_name || addr.address_line1) && (
            <SectionCard icon={MapPin} title="Shipping Address">
              <div className="text-muted-foreground space-y-0.5 text-sm">
                {addr.full_name && (
                  <p className="text-foreground font-medium">{addr.full_name}</p>
                )}
                {addr.address_line1 && <p>{addr.address_line1}</p>}
                {addr.address_line2 && <p>{addr.address_line2}</p>}
                {(addr.city || addr.state || addr.postal_code) && (
                  <p>
                    {[addr.city, addr.state].filter(Boolean).join(", ")}
                    {addr.postal_code ? ` — ${addr.postal_code}` : ""}
                  </p>
                )}
                {addr.phone && (
                  <p className="font-mono text-xs pt-1">{addr.phone}</p>
                )}
              </div>
            </SectionCard>
          )}

          {/* Payment */}
          <SectionCard icon={CreditCard} title="Payment">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="capitalize">{order.payment_method || "Cash on Delivery"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={isPaid ? "success" : "outline"}
                  className="text-xs capitalize"
                >
                  {order.payment_status || "pending"}
                </Badge>
              </div>
              {order.payment_id && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ref ID</span>
                  <span className="font-mono text-xs">{order.payment_id}</span>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Internal order ID for reference */}
          <div className="text-muted-foreground/60 text-xs">
            Internal ID: <span className="font-mono">{order.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Order ${id}` };
}
