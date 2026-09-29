import Link from "next/link";
import { Package, ArrowRight, CheckCircle2, Clock, Truck, XCircle, CircleDot } from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { EmptyState } from "@ui/shadcn/components/empty-state";
import { formatPrice } from "@/lib/format";
import { getCurrentUserOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* Status config – icon, color, label, and "completion" indicator       */
/* ------------------------------------------------------------------ */
const STATUS_CONFIG = {
  delivered: {
    icon: CheckCircle2,
    badgeVariant: "success",
    label: "Delivered",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    isComplete: true,
    description: "Order delivered",
  },
  shipped: {
    icon: Truck,
    badgeVariant: "secondary",
    label: "Shipped",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    isComplete: false,
    description: "On the way",
  },
  processing: {
    icon: CircleDot,
    badgeVariant: "warning",
    label: "Processing",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    isComplete: false,
    description: "Being prepared",
  },
  pending: {
    icon: Clock,
    badgeVariant: "warning",
    label: "Pending",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    isComplete: false,
    description: "Awaiting confirmation",
  },
  confirmed: {
    icon: CheckCircle2,
    badgeVariant: "secondary",
    label: "Confirmed",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    isComplete: false,
    description: "Order confirmed",
  },
  cancelled: {
    icon: XCircle,
    badgeVariant: "destructive",
    label: "Cancelled",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    isComplete: false,
    description: "Order cancelled",
  },
};

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status?.toLowerCase()] ?? {
      icon: Package,
      badgeVariant: "secondary",
      label: status || "Unknown",
      color: "text-muted-foreground",
      bg: "bg-muted",
      isComplete: false,
      description: "",
    }
  );
}

/* Pill that shows confirmed vs not complete */
function CompletionPill({ isComplete, status }) {
  if (isComplete) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
        <CheckCircle2 className="size-3" />
        Complete
      </span>
    );
  }
  if (status?.toLowerCase() === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600">
        <XCircle className="size-3" />
        Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
      <Clock className="size-3" />
      In Progress
    </span>
  );
}

export default async function OrdersPage() {
  const orders = await getCurrentUserOrders();

  const completedCount = orders.filter((o) => getStatusConfig(o.status).isComplete).length;
  const activeCount = orders.filter(
    (o) => !getStatusConfig(o.status).isComplete && o.status?.toLowerCase() !== "cancelled"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {orders.length} {orders.length === 1 ? "order" : "orders"} placed
          </p>
        </div>
        {orders.length > 0 && (
          <div className="flex gap-2">
            {activeCount > 0 && (
              <div className="text-cente rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5">
                <p className="text-lg font-semibold text-amber-600">{activeCount}</p>
                <p className="text-xs text-amber-600/70">Active</p>
              </div>
            )}
            {completedCount > 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center">
                <p className="text-lg font-semibold text-emerald-600">{completedCount}</p>
                <p className="text-xs text-emerald-600/70">Completed</p>
              </div>
            )}
          </div>
        )}
      </div>

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = getStatusConfig(order.status);
            const StatusIcon = config.icon;
            const itemNames = (order.order_items || [])
              .map((i) => i.product_name)
              .filter(Boolean)
              .join(", ");

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.order_number || order.id}`}
                className="group border-border bg-card hover:border-primary/30 hover:bg-accent/40 flex flex-col gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center sm:gap-4"
              >
                {/* Status Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                >
                  <StatusIcon className={`size-5 ${config.color}`} />
                </div>

                {/* Order Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="leading-none font-semibold">
                      {order.order_number || `Order #${order.id}`}
                    </p>
                    <CompletionPill isComplete={config.isComplete} status={order.status} />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" · "}
                    {order.order_items?.length || 0}{" "}
                    {order.order_items?.length === 1 ? "item" : "items"}
                  </p>
                  {itemNames && (
                    <p className="text-muted-foreground/70 line-clamp-1 text-xs">{itemNames}</p>
                  )}
                </div>

                {/* Right side: badge + amount + arrow */}
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                  <Badge variant={config.badgeVariant} className="shrink-0 text-xs">
                    {config.label}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums">
                      {formatPrice(order.total_amount)}
                    </span>
                    <ArrowRight className="text-muted-foreground/50 size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-12">
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="When you place an order, you can view its status and receipt here."
            action={
              <Button asChild>
                <Link href="/">Browse Store</Link>
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
