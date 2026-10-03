import { SectionHeader } from "./section-header";
import { ProductCard } from "@/components/store/product-card";
import { fetchBestSellerProducts } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * BestSellerSection - Displays the top 4 best-selling products.
 *
 * @param {{
 *   products?: object[],
 *   limit?: number,
 *   title?: string,
 *   description?: string,
 *   className?: string
 * }} props
 */
export async function BestSellerSection({
  products: initialProducts,
  limit = 4,
  title = "Best Selling Products",
  description = "Explore our most popular and trusted laptop replacement components with guaranteed compatibility.",
  className,
}) {
  const products = initialProducts || (await fetchBestSellerProducts({ limit }));

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={cn("border-border/80 border-t bg-card/30 py-10 sm:py-12 lg:py-16", className)}>
      <div className="container">
        <SectionHeader
          badge="Customer Favorites"
          title={title}
          description={description}
          href="/search?sort=bestseller"
          linkText="See All"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {products.slice(0, limit).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
