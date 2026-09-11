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
    <section className="border-b border-border py-10 lg:py-14">
      <div className="container">
        <SectionHeader
          title="Featured Hardware"
          description="Tested and verified components in stock with same-day dispatch."
          href="/products"
          linkText="View Catalog"
        />

        {/* Minimalist Dynamic Tabs */}
        {tabs.length > 1 && (
          <div className="mb-6 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap border cursor-pointer",
                  activeTab === tab.id
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Live Supabase Product Grid */}
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} columns={4} />
        ) : (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
