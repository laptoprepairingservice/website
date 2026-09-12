import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Package } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { formatPrice } from "@/lib/format";

export function HeroBanner({ featuredProduct }) {
  return (
    <section className="border-b border-border bg-background py-8 sm:py-12 lg:py-16">
      <div className="container">
        <div className={`grid items-center gap-8 ${featuredProduct ? "lg:grid-cols-12 lg:gap-12" : "max-w-3xl"}`}>
          {/* Left Hero Content */}
          <div className={`flex flex-col justify-center space-y-5 ${featuredProduct ? "lg:col-span-7" : ""}`}>
            <span className="inline-flex w-fit items-center gap-2 rounded border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
              Ahmedabad&apos;s Premium Hardware Store
            </span>

            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                High-Performance PC Hardware &amp; Custom Builds
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Direct authorized retail of processors, GPUs, memory, and components in Gujarat.
                Genuine stock, manufacturer warranty, and store pickup.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button size="lg" asChild>
                <Link href="/products" className="gap-2">
                  Browse Catalog
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Store Location</Link>
              </Button>
            </div>

            {/* Value Checkpoints */}
            <div className="grid grid-cols-2 gap-3 pt-3 text-xs text-muted-foreground sm:flex sm:items-center sm:gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-foreground shrink-0" />
                <span>100% Genuine Hardware</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-foreground shrink-0" />
                <span>Direct Brand Warranty</span>
              </div>
            </div>
          </div>

          {/* Right Featured Hardware Card (Loaded from Supabase) */}
          {featuredProduct && (
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="relative aspect-video sm:aspect-square w-full overflow-hidden rounded-lg bg-muted/20 flex items-center justify-center p-4">
                  {featuredProduct.image ? (
                    <Image
                      src={featuredProduct.image}
                      alt={featuredProduct.name}
                      fill
                      unoptimized
                      priority
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-contain p-2"
                    />
                  ) : (
                    <Package className="size-16 text-muted-foreground/30" />
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wider">{featuredProduct.brand}</span>
                    <span className={featuredProduct.inStock ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-rose-500 font-medium"}>
                      {featuredProduct.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground line-clamp-1">
                    {featuredProduct.name}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {featuredProduct.shortDescription || featuredProduct.categoryName}
                  </p>
                  <div className="flex items-baseline justify-between pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-foreground">
                        {formatPrice(featuredProduct.price)}
                      </span>
                      {featuredProduct.originalPrice && featuredProduct.originalPrice > featuredProduct.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(featuredProduct.originalPrice)}
                        </span>
                      )}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/products/${featuredProduct.slug}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
