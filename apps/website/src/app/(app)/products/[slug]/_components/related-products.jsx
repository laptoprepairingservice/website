"use client";

import { ProductGrid } from "@/components/store/product-card";

export function RelatedProducts({ products = [] }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-border pt-16 lg:mt-24">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Related Products
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Customers who viewed this item also looked at these components.
        </p>
      </div>

      <ProductGrid products={products} columns={4} />
    </section>
  );
}
