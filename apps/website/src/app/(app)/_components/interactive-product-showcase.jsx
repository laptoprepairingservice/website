"use client";

import { useState, useMemo } from "react";
import { SectionHeader } from "./section-header";
import { ProductGrid } from "@/components/store/product-card";
import { cn } from "@/lib/utils";

export function InteractiveProductShowcase({ categories = [], products = [] }) {
  const [activeTab, setActiveTab] = useState("all");

  // Dynamically build category tabs from live Supabase data
  const tabs = useMemo(() => {
    const list = [{ id: "all", label: "All Products" }];
    categories.forEach((cat) => {
      list.push({ id: cat.slug, label: cat.name });
    });
    return list;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (activeTab === "all") {
      return products;
    }
    return products.filter((p) => p.category === activeTab);
  }, [activeTab, products]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="border-border border-b py-10 lg:py-14">
      <div className="container">
        <SectionHeader
          title="Featured Hardware"
          description="Tested and verified components in stock with same-day dispatch."
          href={categories[0]?.slug ? `/${categories[0].slug}` : "/charger"}
          linkText="View Catalog"
        />

        {/* Live Supabase Product Grid */}
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} columns={4} />
        ) : (
          <div className="border-border rounded-xl border border-dashed py-12 text-center">
            <p className="text-muted-foreground text-sm">No products found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}
