import Link from "next/link";
import { ArrowRight, Heart, Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { PRODUCTS } from "@/lib/data/products";

const RECENT_ORDERS = [
  { id: "CV-2026-00142", date: "Jan 18, 2026", status: "Delivered", total: 55498, items: 2 },
  { id: "CV-2026-00138", date: "Jan 10, 2026", status: "Shipped", total: 13999, items: 1 },
  { id: "CV-2025-00987", date: "Dec 28, 2025", status: "Delivered", total: 18999, items: 1 },
];

export default function AccountDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Welcome back, Rahul!</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/5">
              <Package className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">12</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/5">
              <Heart className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">5</p>
              <p className="text-sm text-muted-foreground">Wishlist Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/5">
              <ShoppingBag className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">2</p>
              <p className="text-sm text-muted-foreground">Cart Items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account/orders">
              View All
              <ArrowRight />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {RECENT_ORDERS.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.date} · {order.items} items</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={order.status === "Delivered" ? "success" : "secondary"}>{order.status}</Badge>
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Wishlist Summary</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account/wishlist">View Wishlist</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {PRODUCTS.slice(0, 2).map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="flex gap-4 rounded-lg border border-border p-3 hover:bg-accent/50">
                <div className="size-16 shrink-0 rounded-lg bg-muted/30" style={{ backgroundImage: `url(${product.image})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
                <div>
                  <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
                  <p className="mt-1 text-sm font-semibold">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account/tracking">Track an Order</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account/profile">Edit Profile</Link>
        </Button>
      </div>
    </div>
  );
}
