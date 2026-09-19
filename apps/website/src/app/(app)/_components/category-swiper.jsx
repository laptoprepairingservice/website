"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Card rendered inside the client component — no function props needed */
function CategoryCard({ category, variant = "md" }) {
  const textSize = variant === "hero" ? "text-xl sm:text-2xl" : "text-sm sm:text-base";
  const imgSizes =
    variant === "hero"
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 42vw"
      : "(max-width: 640px) 50vw, 30vw";

  return (
    <Link
      href={`/${category.slug}`}
      className={cn(
        "group relative block h-full w-full overflow-hidden rounded-2xl",
        "ring-border/50 ring-1",
        "transition-all duration-300 ease-out",
        "hover:ring-primary/30 hover:shadow-2xl hover:shadow-black/25"
      )}
    >
      {category.image ? (
        <Image
          src={category.image}
          alt={category.name}
          fill
          unoptimized
          sizes={imgSizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      ) : (
        <div className="g-linear-to-br from-primary/20 via-primary/5 to-muted absolute inset-0">
          <span className="text-primary/10 absolute inset-0 flex items-center justify-center text-[5rem] leading-none font-black uppercase select-none">
            {category.name.slice(0, 2)}
          </span>
        </div>
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

      {/* Arrow CTA */}
      <div className="absolute top-3 right-3 z-10 flex size-9 scale-75 items-center justify-center rounded-full bg-white/95 text-gray-900 opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
        <ArrowUpRight className="size-4" strokeWidth={2.5} />
      </div>

      {/* Label */}
      <div className="absolute right-0 bottom-0 left-0 z-10 p-4">
        <p className={cn("leading-tight font-bold text-white drop-shadow-sm", textSize)}>
          {category.name}
        </p>
        {category.count != null && (
          <p className="mt-0.5 text-xs font-medium text-white/60">
            {category.count} {category.count === 1 ? "product" : "products"}
          </p>
        )}
      </div>
    </Link>
  );
}

/**
 * JS-driven infinite auto-scroll marquee.
 * Accepts only serializable `categories` data — no function props.
 * Pauses on hover / touch.
 */
export function CategoryMarquee({ categories, speed = 0.6, gap = 12 }) {
  const wrapRef = useRef(null);
  const pausedRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const tick = () => {
      if (!pausedRef.current) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const pause = () => {
      pausedRef.current = true;
    };
    const resume = () => {
      pausedRef.current = false;
    };

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, [speed]);

  const renderSlide = (cat, i, prefix) => (
    <div
      key={`${prefix}-${cat.id ?? cat.slug ?? i}`}
      aria-hidden={prefix === "b"}
      style={{
        flexShrink: 0,
        width: i === 0 ? "clamp(260px, 30vw, 384px)" : "clamp(180px, 18vw, 256px)",
        height: "272px",
      }}
    >
      <CategoryCard category={cat} variant={i === 0 ? "hero" : "md"} />
    </div>
  );

  return (
    <div
      ref={wrapRef}
      className="hide-scrollbar overflow-x-auto"
      style={{ scrollBehavior: "auto" }}
    >
      <div className="flex" style={{ width: "max-content", gap: `${gap}px` }}>
        {categories.map((cat, i) => renderSlide(cat, i, "a"))}
        {categories.map((cat, i) => renderSlide(cat, i, "b"))}
      </div>
    </div>
  );
}
