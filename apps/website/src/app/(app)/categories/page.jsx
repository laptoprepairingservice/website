import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Laptop, Layers, PackageOpen, Sparkles } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ui/shadcn/components/breadcrumb";
import { Badge } from "@ui/shadcn/components/badge";
import { fetchStoreNavCategoriesWithBrands } from "@/lib/store";

export const revalidate = 60;

export const metadata = {
  title: "Product Collections | Genuine Laptop Hardware & Components",
  description:
    "Explore our complete inventory of genuine OEM replacement laptop parts, keyboards, batteries, chargers, screens, and internal components.",
};

export default async function CollectionsPage() {
  const categories = await fetchStoreNavCategoriesWithBrands();

  return (
    <div className="container py-5 sm:py-8 lg:py-12">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Collections</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Header Section */}
      <div className="border-border/80 from-card to-muted/20 mt-4 rounded-3xl border bg-linear-to-b p-6 shadow-xs sm:p-8 lg:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
              <Sparkles className="size-3.5" />
              <span>Component Catalog</span>
            </div>

            <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Browse All Collections
            </h1>

            <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
              Find exact-match OEM replacement laptop parts, components, and hardware accessories
              organized by device category.
            </p>
          </div>

          <div className="bg-background/80 border-border/80 flex shrink-0 items-center gap-3 rounded-2xl border p-4 shadow-2xs backdrop-blur-xs">
            <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
              <Layers className="size-6" />
            </div>
            <div>
              <span className="text-foreground text-2xl font-black tracking-tight">
                {categories.length}
              </span>
              <p className="text-muted-foreground text-xs font-medium">Categories Listed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="mt-8">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat) => {
              const brandList = cat.brands || [];
              const brandCount = brandList.length;

              return (
                <Link
                  key={cat.id || cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="group border-border/80 bg-card hover:border-primary/40 flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl"
                >
                  {/* Top Thumbnail Image */}
                  <div className="bg-muted/40 border-border/60 relative aspect-16/10 w-full overflow-hidden border-b">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Laptop className="text-muted-foreground/50 size-12" />
                      </div>
                    )}

                    {/* Total Products Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="secondary"
                        className="bg-background/90 text-foreground border-border/70 border text-xs font-semibold shadow-2xs backdrop-blur-md"
                      >
                        {cat.count} {cat.count === 1 ? "Product" : "Products"}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h2 className="text-foreground group-hover:text-primary line-clamp-1 text-base font-bold tracking-tight transition-colors sm:text-lg">
                        {cat.name}
                      </h2>

                      {/* Brands Summary */}
                      <div className="mt-2 min-h-6">
                        {brandCount > 0 ? (
                          <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="text-foreground/80 font-medium">Brands:</span>
                            <span>
                              {brandList
                                .slice(0, 3)
                                .map((b) => b.name)
                                .join(", ")}
                              {brandCount > 3 ? ` +${brandCount - 3} more` : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/70 text-xs italic">
                            All compatible models
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="border-border/60 text-primary mt-4 flex items-center justify-between border-t pt-3.5 text-xs font-semibold">
                      <span>Explore Collection</span>
                      <div className="bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground flex size-7 items-center justify-center rounded-lg transition-colors">
                        <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="border-border rounded-2xl border border-dashed p-12 text-center">
            <PackageOpen className="text-muted-foreground/40 mx-auto mb-3 size-12" />
            <h3 className="text-foreground text-base font-semibold">No Collections Found</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Check back soon as we update the hardware catalog.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
