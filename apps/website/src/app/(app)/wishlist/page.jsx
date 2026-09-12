import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductGrid } from "@/components/store/product-card";
import { Button } from "@ui/shadcn/components/button";
import { EmptyState } from "@ui/shadcn/components/empty-state";
import { getCurrentUserWishlistProducts } from "@/lib/wishlist";

export const metadata = {
  title: "Wishlist",
  description: "Your saved computer hardware products.",
};

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const products = await getCurrentUserWishlistProducts();

  return (
    <div className="py-8 lg:py-12">
      <h1 className="text-3xl font-semibold">Wishlist</h1>
      <p className="text-muted-foreground mt-1">
        {products.length} {products.length === 1 ? "item" : "items"} saved
      </p>
      <div className="mt-8">
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="py-12">
            <EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              description="Save hardware components you're interested in by clicking the heart icon on any product."
              action={
                <Button asChild>
                  <Link href="/products">Browse Products</Link>
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
