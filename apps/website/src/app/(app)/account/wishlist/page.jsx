import { ProductGrid } from "@/components/store/product-card";
import { PRODUCTS } from "@/lib/data/products";

export default function AccountWishlistPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Wishlist</h1>
        <p className="mt-1 text-muted-foreground">{PRODUCTS.slice(0, 5).length} items saved</p>
      </div>
      <ProductGrid products={PRODUCTS.slice(0, 5)} />
    </div>
  );
}
