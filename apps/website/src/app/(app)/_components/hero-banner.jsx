"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Button } from "@ui/shadcn/components/button";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export function HeroBanner({ categories = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter valid categories (prefer top-level categories without parent_id)
  const slides = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) return [];

    const topLevel = categories.filter((c) => c && c.slug && !c.parentId);
    const validCategories = topLevel.length > 0 ? topLevel : categories.filter((c) => c && c.slug);

    return validCategories;
  }, [categories]);

  if (slides.length === 0) {
    return (
      <section className="border-border bg-background border-b py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-border/80 bg-card max-w-3xl rounded-3xl border p-8 sm:p-12">
            <span className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              Ahmedabad&apos;s Premium Hardware Store
            </span>
            <h1 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              High-Performance PC Hardware &amp; Components
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed sm:text-base">
              Direct authorized retail of processors, GPUs, memory, and components in Gujarat.
              Genuine stock, manufacturer warranty, and store pickup.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/contact" className="gap-2">
                  Store Location
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-background">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={800}
        loop={slides.length > 1}
        autoplay={{
          delay: 5500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          el: ".hero-slider-pagination",
          clickable: true,
          bulletClass: "hero-slider-bullet",
          bulletActiveClass: "hero-slider-bullet-active",
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-[520px] w-full sm:h-[600px] md:h-[660px] lg:h-[720px] xl:h-[780px]"
      >
        {slides.map((category, index) => {
          const bgImage =
            category.image ||
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1600&q=80";

          return (
            <SwiperSlide key={category.id || category.slug} className="relative size-full">
              {/* Full-Screen Category Background Image */}
              <div className="absolute inset-0 size-full overflow-hidden">
                <Image
                  src={bgImage}
                  alt={category.name}
                  fill
                  priority={index === 0}
                  unoptimized
                  sizes="100vw"
                  className="size-full object-cover object-center"
                />

                {/* Gradient Overlay 1: Heavy left contrast gradient for text legibility */}
                <div className="from-background via-background/85 to-background/25 sm:via-background/75 absolute inset-0 bg-linear-to-r sm:to-transparent" />

                {/* Gradient Overlay 2: Vertical bottom gradient for indicators readability */}
                <div className="from-background/95 via-background/40 absolute inset-0 bg-linear-to-t to-transparent" />

                {/* Gradient Overlay 3: Ambient accent glow */}
                <div className="from-primary/15 pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,var(--tw-gradient-stops))] via-transparent to-transparent" />
              </div>

              {/* Foreground Content Card aligned to site grid */}
              <div className="relative z-20 flex size-full items-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-2xl lg:max-w-3xl">
                    {/* Category Badge */}
                    <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wide uppercase shadow-2xs backdrop-blur-md">
                      <Sparkles className="size-3.5" />
                      <span>
                        {category.count > 0
                          ? `${category.count} Products in Stock`
                          : "Featured Hardware Category"}
                      </span>
                    </div>

                    {/* Category Title */}
                    <h1 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                      {category.name}
                    </h1>

                    {/* Category Description */}
                    <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed sm:text-base md:text-lg">
                      {category.description ||
                        `Explore our comprehensive collection of genuine ${category.name} with official manufacturer warranty and same-day Gujarat dispatch.`}
                    </p>

                    {/* Redirect / Action Buttons */}
                    <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
                      <Button
                        size="lg"
                        asChild
                        className="group shadow-primary/20 hover:shadow-primary/35 cursor-pointer rounded-xl font-semibold shadow-lg transition-all hover:scale-[1.02]"
                      >
                        <Link href={`/${category.slug}`} className="flex items-center gap-2">
                          <span>Explore {category.name}</span>
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="border-border/80 bg-background/60 hover:bg-background/90 rounded-xl font-medium backdrop-blur-md transition-colors"
                      >
                        <Link href="/contact">Showroom Pickup</Link>
                      </Button>
                    </div>

                    {/* Value Trust Checkpoints */}
                    <div className="border-border/50 text-muted-foreground mt-6 flex flex-wrap items-center gap-4 border-t pt-5 text-xs sm:mt-8 sm:gap-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-primary size-4 shrink-0" />
                        <span className="text-foreground/90 font-medium">100% Genuine Hardware</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-primary size-4 shrink-0" />
                        <span className="text-foreground/90 font-medium">Official Brand Warranty</span>
                      </div>
                      <div className="hidden items-center gap-2 sm:flex">
                        <CheckCircle2 className="text-primary size-4 shrink-0" />
                        <span className="text-foreground/90 font-medium">Gujarat Express Dispatch</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Slider Pagination & Counter Bar */}
      {slides.length > 1 && (
        <div className="bg-background/70 border-border/50 absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border px-4 py-1.5 shadow-lg backdrop-blur-md sm:bottom-8">
          <div className="hero-slider-pagination flex items-center gap-1.5" />
          <div className="border-border/80 text-muted-foreground border-l pl-2.5 font-mono text-[11px] font-semibold">
            <span className="text-foreground">{String(activeIndex + 1).padStart(2, "0")}</span>
            <span className="opacity-50">/</span>
            <span>{String(slides.length).padStart(2, "0")}</span>
          </div>
        </div>
      )}

      <style jsx global>{`
        .hero-slider-bullet {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background-color: var(--muted-foreground);
          opacity: 0.35;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .hero-slider-bullet-active {
          width: 24px;
          background-color: var(--primary) !important;
          opacity: 1 !important;
          border-radius: 9999px;
        }
      `}</style>
    </section>
  );
}
