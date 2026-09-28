import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, TrendingUp } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/shadcn/components/card";
import { Badge } from "@ui/shadcn/components/badge";
import { formatPrice } from "@/lib/format";
import { getAccountDashboardData } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
import { getProductUrl } from "@/lib/url";
import { AccountDashboardStats } from "./_components/account-dashboard-stats";

export const dynamic = "force-dynamic";

const STATUS_META = {
  delivered: { variant: "success", label: "Delivered" },
  shipped: { variant: "secondary", label: "Shipped" },
  processing: { variant: "warning", label: "Processing" },
  pending: { variant: "warning", label: "Pending" },
  confirmed: { variant: "secondary", label: "Confirmed" },
  cancelled: { variant: "destructive", label: "Cancelled" },
};

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
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">
          Hi, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your account
        </p>
      </div>

      {/* Stats */}
      <AccountDashboardStats ordersCount={ordersCount} wishlistCount={wishlistCount} />

      {/* Recent Orders */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </div>
          {recentOrders.length > 0 && (
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/account/orders" className="flex items-center gap-1">
                View all
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => {
                const meta =
                  STATUS_META[order.status?.toLowerCase()] ?? {
                    variant: "secondary",
                    label: order.status,
                  };
                const isComplete = order.status?.toLowerCase() === "delivered";

                return (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.order_number || order.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-accent/40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {order.order_number || `Order #${order.id}`}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        · {order.order_items?.length || 0}{" "}
                        {order.order_items?.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {!isComplete && (
                        <span className="hidden h-1.5 w-1.5 rounded-full bg-amber-400 sm:block" />
                      )}
                      <Badge variant={meta.variant} className="text-xs">
                        {meta.label}
                      </Badge>
                      <span className="hidden font-semibold tabular-nums sm:block">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <Package className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No orders placed yet.</p>
              <Button variant="link" size="sm" asChild className="mt-1">
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wishlist */}
      {wishlistProducts.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Saved Items</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/account/wishlist" className="flex items-center gap-1">
                View all
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {wishlistProducts.map((product) => (
                <Link
                  key={product.id}
                  href={getProductUrl(product)}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-accent/40"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted/30">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <Package className="m-auto size-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">
                      {product.name}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-primary">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" asChild>
          <Link href="/">Browse Store</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href="/account/tracking">Track Order</Link>
        </Button>
      </div>
    </div>
  );
}
