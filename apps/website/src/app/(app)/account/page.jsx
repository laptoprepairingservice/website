import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/shadcn/components/card";
import { Badge } from "@ui/shadcn/components/badge";
import { LogoutButton } from "@/components/auth/logout-button";
import { formatPrice } from "@/lib/format";
import { getAccountDashboardData } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
import { getProductUrl } from "@/lib/url";
import { AccountDashboardStats } from "./_components/account-dashboard-stats";

export const dynamic = "force-dynamic";

export default async function AccountDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "there";

  const { ordersCount, recentOrders, wishlistCount, wishlistProducts } =
    await getAccountDashboardData();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome back, {firstName}!</p>
        </div>
        <LogoutButton />
      </div>

      <AccountDashboardStats ordersCount={ordersCount} wishlistCount={wishlistCount} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          {recentOrders.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/account/orders">
                View All
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.order_number || order.id}`}
                  className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{order.order_number || `Order #${order.id}`}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {order.order_items?.length || 0} items
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={order.status === "delivered" ? "success" : "secondary"}>
                      {order.status}
                    </Badge>
                    <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <p>No orders placed yet.</p>
              <Button variant="link" size="sm" asChild className="mt-2">
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          )}
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
          {wishlistProducts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {wishlistProducts.map((product) => (
                <Link
                  key={product.id}
                  href={getProductUrl(product)}
                  className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="relative size-16 shrink-0 rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden border border-border/50">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <Package className="size-6 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
                    <p className="mt-1 text-sm font-semibold">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <p>Your wishlist is empty.</p>
              <Button variant="link" size="sm" asChild className="mt-2">
                <Link href="/">Discover Products</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/">Browse Store</Link>
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
