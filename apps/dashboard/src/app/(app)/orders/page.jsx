"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Clock,
  Eye,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import List from "@/components/react-list";
import { formatPrice } from "@/lib/format";

/* -------------------------------------------------------------------------- */
/* Status helpers                                                              */
/* -------------------------------------------------------------------------- */

const ORDER_STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: "Pending",
    badgeVariant: "warning",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  confirmed: {
    icon: CircleDot,
    label: "Confirmed",
    badgeVariant: "secondary",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  processing: {
    icon: CircleDot,
    label: "Processing",
    badgeVariant: "warning",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  shipped: {
    icon: Truck,
    label: "Shipped",
    badgeVariant: "secondary",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  delivered: {
    icon: CheckCircle2,
    label: "Delivered",
    badgeVariant: "success",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    badgeVariant: "destructive",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
};

function getStatusConfig(status) {
  return (
    ORDER_STATUS_CONFIG[status?.toLowerCase()] ?? {
      icon: Package,
      label: status || "Unknown",
      badgeVariant: "secondary",
      color: "text-muted-foreground",
      bg: "bg-muted",
    }
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/* Table columns                                                               */
/* -------------------------------------------------------------------------- */

function useOrderColumns() {
  return useMemo(
    () => [
      {
        accessorKey: "order_number",
        header: "Order",
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <Link
                href={`/orders/${order.id}`}
                className="text-foreground hover:text-primary font-medium transition"
              >
                {order.order_number || `#${order.id}`}
              </Link>
              <span className="text-muted-foreground font-mono text-xs">
                {formatDate(order.created_at)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const config = getStatusConfig(row.original.status);
          return (
            <Badge variant={config.badgeVariant} className="capitalize">
              {config.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "payment_status",
        header: "Payment",
        cell: ({ row }) => {
          const ps = row.original.payment_status;
          const isPaid = ps === "paid";
          return (
            <Badge variant={isPaid ? "success" : "outline"} className="capitalize">
              {ps || "cod"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "items",
        header: "Items",
        cell: ({ row }) => {
          const count = row.original.order_items?.length ?? 0;
          return (
            <span className="text-muted-foreground text-sm">
              {count} {count === 1 ? "item" : "items"}
            </span>
          );
        },
      },
      {
        accessorKey: "total_amount",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">
            {formatPrice(row.original.total_amount)}
          </span>
        ),
      },
      {
        accessorKey: "shipping_address",
        header: "Customer",
        cell: ({ row }) => {
          const addr = row.original.shipping_address || {};
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-foreground text-sm font-medium">{addr.full_name || "—"}</span>
              {addr.phone && (
                <span className="text-muted-foreground font-mono text-xs">{addr.phone}</span>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground size-8"
          >
            <Link href={`/orders/${row.original.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
        ),
      },
    ],
    []
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function OrdersPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const columns = useOrderColumns();

  return (
    <div className="space-y-4">
      <List
        key={refreshToken}
        title="Orders"
        endpoint="orders"
        select="id, order_number, status, payment_status, payment_method, subtotal, shipping_amount, discount_amount, total_amount, shipping_address, created_at, order_items(id, product_name, quantity, unit_price, subtotal)"
        sortBy="created_at"
        sortOrder="desc"
        meta={{ search: "order_number" }}
        searchPlaceholder="Search by order number..."
        columns={columns}
      >
        {({ items }) => {
          if (items.length === 0) return null;

          return (
            <div className="grid gap-2 pt-2">
              {items.map((order) => {
                const config = getStatusConfig(order.status);
                const StatusIcon = config.icon;
                const addr = order.shipping_address || {};
                const itemCount = order.order_items?.length ?? 0;
                const isPaid = order.payment_status === "paid";

                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="group border-border bg-card/60 hover:bg-card hover:border-primary/30 flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-sm"
                  >
                    {/* Status icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                    >
                      <StatusIcon className={`size-5 ${config.color}`} />
                    </div>

                    {/* Order info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{order.order_number || `#${order.id}`}</p>
                        <Badge variant={config.badgeVariant} className="text-xs capitalize">
                          {config.label}
                        </Badge>
                        {!isPaid && (
                          <Badge variant="outline" className="text-xs">
                            COD
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                        <span>{addr.full_name || "—"}</span>
                        <span>·</span>
                        <span>{formatDate(order.created_at)}</span>
                        <span>·</span>
                        <span>
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </div>

                    {/* Amount + arrow */}
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold tabular-nums">
                        {formatPrice(order.total_amount)}
                      </span>
                      <ArrowRight className="text-muted-foreground/40 size-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        }}
      </List>
    </div>
  );
}
