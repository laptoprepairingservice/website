import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { formatPrice } from "@/lib/format";

export function HeroBanner() {
  return (
    <section className="border-b border-border bg-background py-8 sm:py-12 lg:py-16">
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Hero Content */}
          <div className="flex flex-col justify-center space-y-5 lg:col-span-7">
            <span className="inline-flex w-fit items-center gap-2 rounded border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
              Ahmedabad&apos;s Premium Hardware Store
            </span>

            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                High-Performance PC Hardware &amp; Custom Builds
              </h1>
              <p className="max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                Shop 100% genuine processors, RTX 40-series graphics cards, motherboards, DDR5 RAM, and NVMe SSDs. Official manufacturer warranty and same-day Gujarat dispatch.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button size="lg" asChild>
                <Link href="/products">
                  Shop All Components
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Order Custom PC</Link>
              </Button>
            </div>

            {/* Value Trust Strip */}
            <div className="grid grid-cols-1 gap-2 pt-4 border-t border-border sm:grid-cols-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-foreground shrink-0" />
                <span>100% Genuine with GST</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-foreground shrink-0" />
                <span>Same-Day Ahmedabad Pickup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-foreground shrink-0" />
                <span>Direct Brand Warranty</span>
              </div>
            </div>
          </div>

          {/* Right Featured Hardware Card */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="relative aspect-video sm:aspect-square w-full overflow-hidden rounded-lg bg-muted/20 flex items-center justify-center p-4">
                <Image
                  src="https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&h=800&fit=crop"
                  alt="NVIDIA GeForce RTX 4090"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-contain p-2"
                />
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider">Flagship GPU</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">In Stock</span>
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  NVIDIA GeForce RTX 4090 24GB
                </h2>
                <p className="text-xs text-muted-foreground">
                  24GB GDDR6X · 16,384 CUDA Cores · DLSS 3.5 Ready
                </p>
                <div className="flex items-baseline justify-between pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-foreground">
                      {formatPrice(154999)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(169999)}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/products/nvidia-rtx-4090-fe">
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
