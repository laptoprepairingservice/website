"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { PRODUCTS } from "@/lib/data/products";

export function FlashDealsSection() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 20 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Show top 4 deals in clean normalized grid
  const dealProducts = PRODUCTS.slice(0, 4);

  return (
    <section className="border-b border-border py-10 lg:py-14">
      <div className="container">
        {/* Clean Header with Minimalist Timer */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="rounded border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                Special Offers
              </span>
              <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                <Clock className="size-3.5" />
                <span>
                  Ends in {String(timeLeft.hours).padStart(2, "0")}h:
                  {String(timeLeft.minutes).padStart(2, "0")}m:
                  {String(timeLeft.seconds).padStart(2, "0")}s
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Limited-Time Deals
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Promotional discounts on rig-tested hardware components.
            </p>
          </div>

          <Link
            href="/products?sort=popular"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors self-start sm:self-auto"
          >
            View All Deals
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Clean 4-column Product Grid with Intact ProductCard */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {dealProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
