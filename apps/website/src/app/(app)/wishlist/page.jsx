import { ProductGrid } from "@/components/store/product-card";
import { PRODUCTS } from "@/lib/data/products";

export const metadata = {
  title: "Wishlist",
  description: "Your saved computer hardware products.",
};

export default function WishlistPage() {
  return (
    <div className="py-8 lg:py-12">
      <h1 className="text-3xl font-semibold">Wishlist</h1>
      <p className="text-muted-foreground mt-1">{PRODUCTS.slice(0, 5).length} items saved</p>
      <div className="mt-8">
        <ProductGrid products={PRODUCTS.slice(0, 5)} />
      </div>
    </div>
  );
}
