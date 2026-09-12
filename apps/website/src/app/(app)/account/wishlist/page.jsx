import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductGrid } from "@/components/store/product-card";
import { Button } from "@ui/shadcn/components/button";
import { EmptyState } from "@ui/shadcn/components/empty-state";
import { getCurrentUserWishlistProducts } from "@/lib/wishlist";

export const dynamic = "force-dynamic";

export default async function AccountWishlistPage() {
  const products = await getCurrentUserWishlistProducts();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Wishlist</h1>
        <p className="mt-1 text-muted-foreground">
          {products.length} {products.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="py-12">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save components to your wishlist to keep track of hardware and price changes."
            action={
              <Button asChild>
                <Link href="/products">Explore Products</Link>
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
