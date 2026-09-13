import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { EmptyState } from "@ui/shadcn/components/empty-state";
import { formatPrice } from "@/lib/format";
import { getCurrentUserOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

const statusVariant = {
  delivered: "success",
  shipped: "secondary",
  pending: "warning",
  processing: "warning",
  cancelled: "destructive",
};

export default async function OrdersPage() {
  const orders = await getCurrentUserOrders();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Orders</h1>
        <p className="mt-1 text-muted-foreground">
          {orders.length} {orders.length === 1 ? "order" : "orders"} placed
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="hidden grid-cols-12 gap-4 border-b border-border bg-muted/30 px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid">
            <div className="col-span-3">Order</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Items</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          {orders.map((order) => {
            const itemNames = (order.order_items || [])
              .map((i) => i.product_name)
              .filter(Boolean)
              .join(", ");

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.order_number || order.id}`}
                className="grid grid-cols-1 gap-2 border-b border-border px-6 py-4 transition-colors last:border-0 hover:bg-accent/30 md:grid-cols-12 md:items-center md:gap-4"
              >
                <div className="font-medium md:col-span-3">
                  {order.order_number || `Order #${order.id}`}
                </div>
                <div className="text-sm text-muted-foreground md:col-span-2">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="md:col-span-2">
                  <Badge variant={statusVariant[order.status?.toLowerCase()] || "secondary"}>
                    {order.status}
                  </Badge>
                </div>
                <div className="line-clamp-1 text-sm text-muted-foreground md:col-span-3">
                  {itemNames || `${order.order_items?.length || 0} items`}
                </div>
                <div className="font-semibold md:col-span-2 md:text-right">
                  {formatPrice(order.total_amount)}
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
