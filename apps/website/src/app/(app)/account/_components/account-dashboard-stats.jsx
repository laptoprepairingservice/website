"use client";

import { Heart, Package, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@ui/shadcn/components/card";
import { useAppContext } from "@/app/_context";

export function AccountDashboardStats({ ordersCount = 0, wishlistCount = 0 }) {
  const { cartCount } = useAppContext();

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/5">
            <Package className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{ordersCount}</p>
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
            <p className="text-2xl font-semibold">{wishlistCount}</p>
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
            <p className="text-2xl font-semibold">{cartCount}</p>
            <p className="text-sm text-muted-foreground">Cart Items</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
