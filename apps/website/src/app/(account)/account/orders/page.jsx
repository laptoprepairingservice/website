import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

const ORDERS = [
  { id: "CV-2026-00142", date: "Jan 18, 2026", status: "Delivered", total: 55498, items: ["AMD Ryzen 9 7950X", "Corsair Vengeance 32GB DDR5"] },
  { id: "CV-2026-00138", date: "Jan 10, 2026", status: "Shipped", total: 13999, items: ["Logitech G PRO X SUPERLIGHT 2"] },
  { id: "CV-2025-00987", date: "Dec 28, 2025", status: "Delivered", total: 18999, items: ["Samsung 990 PRO 2TB NVMe SSD"] },
  { id: "CV-2025-00956", date: "Dec 15, 2025", status: "Cancelled", total: 72999, items: ["MSI GeForce RTX 4070 Ti GAMING X TRIO"] },
];

const statusVariant = {
  Delivered: "success",
  Shipped: "secondary",
  Pending: "warning",
  Cancelled: "destructive",
};

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Orders</h1>
        <p className="mt-1 text-muted-foreground">View and track your order history</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="hidden grid-cols-12 gap-4 border-b border-border bg-muted/30 px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid">
          <div className="col-span-3">Order</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Items</div>
          <div className="col-span-2 text-right">Total</div>
        </div>
        {ORDERS.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="grid grid-cols-1 gap-2 border-b border-border px-6 py-4 transition-colors last:border-0 hover:bg-accent/30 md:grid-cols-12 md:items-center md:gap-4"
          >
            <div className="font-medium md:col-span-3">{order.id}</div>
            <div className="text-sm text-muted-foreground md:col-span-2">{order.date}</div>
            <div className="md:col-span-2">
              <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
            </div>
            <div className="line-clamp-1 text-sm text-muted-foreground md:col-span-3">
              {order.items.join(", ")}
            </div>
            <div className="font-semibold md:col-span-2 md:text-right">{formatPrice(order.total)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
