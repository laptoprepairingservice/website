import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";

export function PromotionalBanner() {
  return (
    <section className="border-b border-border py-10 lg:py-14">
      <div className="container">
        <div className="grid gap-4 md:grid-cols-2 sm:gap-6">
          {/* Card 1: High-Refresh Monitors */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 sm:p-8 min-h-[220px]">
            <div className="space-y-2.5">
              <span className="inline-block rounded border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Display Special
              </span>
              <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                Up to 25% Off 240Hz &amp; OLED Monitors
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Color-accurate displays and esports panels from LG UltraGear, ASUS ROG, and Samsung Odyssey.
              </p>
            </div>
            <div className="pt-5">
              <Button variant="outline" asChild>
                <Link href="/products?category=monitors">
                  Shop Gaming Displays
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Card 2: DDR5 & NVMe SSDs */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-muted/30 p-6 sm:p-8 min-h-[220px]">
            <div className="space-y-2.5">
              <span className="inline-block rounded border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                High-Speed Storage
              </span>
              <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                Next-Gen DDR5 Memory &amp; Gen4 NVMe SSDs
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Maximum bandwidth for creative workloads and gaming with Samsung 990 PRO and Corsair kits.
              </p>
            </div>
            <div className="pt-5">
              <Button variant="outline" asChild>
                <Link href="/products?category=storage">
                  Shop Fast Storage
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
