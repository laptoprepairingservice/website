"use client";

import { useState } from "react";
import { SectionHeader } from "./section-header";
import { ProductGrid } from "@/components/store/product-card";
import { PRODUCTS } from "@/lib/data/products";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All Featured" },
  { id: "processors", label: "Processors" },
  { id: "graphics-cards", label: "Graphics Cards" },
  { id: "memory", label: "Memory" },
  { id: "storage", label: "Storage" },
  { id: "peripherals", label: "Peripherals" },
];

export function InteractiveProductShowcase() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredProducts = activeTab === "all"
    ? PRODUCTS.slice(0, 8)
    : PRODUCTS.filter((p) => p.category === activeTab);

  return (
    <section className="border-b border-border py-10 lg:py-14">
      <div className="container">
        <SectionHeader
          title="Featured Components"
          description="Tested and verified PC components in stock with same-day dispatch."
          href="/products"
          linkText="View Catalog"
        />

        {/* Normalized Minimalist Tabs */}
        <div className="mb-6 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap border",
                activeTab === tab.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid with Intact ProductCard */}
        <ProductGrid products={filteredProducts} columns={4} />
      </div>
    </section>
  );
}
