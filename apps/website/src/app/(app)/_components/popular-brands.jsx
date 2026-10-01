"use client";

import Link from "next/link";
import { LogoLoop } from "@/components/animation/logo-loop";
import { SectionHeader } from "./section-header";
import { cn } from "@/lib/utils";

/**
 * Builds LogoLoop `logos` array from brand list, rendering only the database logo image.
 */
function buildBrandLogos(brands) {
  return brands
    .filter((brand) => Boolean(brand.logo))
    .map((brand) => ({
      node: (
        <Link
          href={`/${brand.slug}`}
          className="group/brand flex h-14 min-w-[130px] items-center justify-center rounded-xl border border-border/40 bg-card/40 px-6 py-2.5 backdrop-blur-xs transition-all duration-300 hover:border-border hover:bg-card/90 hover:shadow-xs"
          aria-label={brand.name}
          title={brand.name}
        >
          <img
            src={brand.logo}
            alt={`${brand.name} logo`}
            className={cn(
              "h-8 md:h-9 w-auto max-w-[110px] object-contain select-none transition-all duration-300",
              "opacity-75 group-hover/brand:opacity-100 group-hover/brand:scale-105",
              brand.slug?.toLowerCase() === "apple" && "dark:invert"
            )}
            loading="lazy"
            draggable={false}
          />
        </Link>
      ),
      ariaLabel: brand.name,
    }));
}

export function PopularBrands({ brands = [] }) {
  if (!brands || brands.length === 0) return null;

  const logos = buildBrandLogos(brands);

  return (
    <section className="border-border border-b bg-muted/20 py-10 lg:py-14">
      <div className="container">
        <SectionHeader
          title="Direct Authorized Partners"
          description="All components include official Indian manufacturer warranty and service center support across Gujarat."
          align="center"
        />
      </div>

      {/* Full-bleed logo loop — edge-to-edge animated marquee */}
      <div className="mt-8">
        <LogoLoop
          logos={logos}
          speed={45}
          gap={24}
          logoHeight={56}
          pauseOnHover
          fadeOut
          scaleOnHover
          ariaLabel="Authorized brand partners"
        />
      </div>
    </section>
  );
}

