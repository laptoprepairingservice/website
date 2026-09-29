import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { formatPrice } from "@/lib/format";
import { formatDate, getOrderStatus } from "../_lib/utils";
import { SectionTitle } from "./section-title";
import { EmptySection } from "./empty-section";

function OrderRow({ order }) {
  const cfg = getOrderStatus(order.status);
  const StatusIcon = cfg.icon;
  const itemCount = order.order_items?.length ?? 0;

  return (
    <Link
      href={`/orders/${order.id}`}
      className="border-border bg-card hover:bg-accent/40 hover:border-primary/30 group flex items-center gap-3 rounded-xl border p-3.5 transition-colors"
    >
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
        <StatusIcon className={`size-4 ${cfg.color}`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-foreground text-sm font-semibold">
            {order.order_number || `#${order.id}`}
          </p>
          <Badge variant={cfg.variant} className="text-[10px] capitalize">
            {cfg.label}
          </Badge>
          {order.payment_status === "paid" && (
            <Badge variant="success" className="text-[10px]">Paid</Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {formatDate(order.created_at)} · {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-foreground text-sm font-semibold tabular-nums">
          {formatPrice(order.total_amount)}
        </span>
        <ArrowRight className="text-muted-foreground/40 size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function UserOrdersList({ orders, userId }) {
  return (
    <div>
      <SectionTitle
        icon={ShoppingBag}
        title="Order History"
        count={orders.length}
        action={
          orders.length > 0 && (
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href={`/orders?user=${userId}`}>
                View all <ArrowRight className="size-3" />
              </Link>
            </Button>
          )
        }
      />

      {orders.length === 0 ? (
        <EmptySection icon={ShoppingBag} message="No orders placed yet." />
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
