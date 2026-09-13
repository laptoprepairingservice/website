"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * CategoryPillsBar - Single horizontal scrollable row of category pills
 * Rendered ONCE right below page header
 */
export function CategoryPillsBar({ categories = [], className }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategories = useMemo(() => {
    const raw = searchParams.get("category");
    return raw
      ? raw
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      : [];
  }, [searchParams]);

  if (categories.length === 0) return null;

  const handleToggle = (slug) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (!slug) {
      params.delete("category");
    } else {
      const lower = slug.toLowerCase();
      if (currentCategories.includes(lower)) {
        const remaining = currentCategories.filter((c) => c !== lower);
        if (remaining.length > 0) params.set("category", remaining.join(","));
        else params.delete("category");
      } else {
        // Toggle category
        params.set("category", lower);
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        "no-scrollbar -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 py-1",
        className
      )}
    >
      <button
        type="button"
        onClick={() => handleToggle("")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-2xs transition-colors",
          currentCategories.length === 0
            ? "bg-primary text-primary-foreground font-semibold"
            : "bg-muted/70 text-muted-foreground hover:bg-accent border-border/60 border"
        )}
      >
        All
      </button>

      {categories.map((cat) => {
        const slug = (cat.slug || "").toLowerCase();
        const isSelected = currentCategories.includes(slug);
        return (
          <button
            key={cat.id || cat.slug}
            type="button"
            onClick={() => handleToggle(slug)}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-2xs transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/70 text-muted-foreground hover:bg-accent border-border/60 border"
            )}
          >
            <span>{cat.name}</span>
            {cat.count > 0 && (
              <span
                className={cn(
                  "py-0.2 rounded-full px-1 text-[10px]",
                  isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background/80 text-muted-foreground"
                )}
              >
                {cat.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
