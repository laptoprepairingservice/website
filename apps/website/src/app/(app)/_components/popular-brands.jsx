import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SectionHeader } from "./section-header";
import { BRANDS } from "@/lib/data/products";

export function PopularBrands() {
  return (
    <section className="border-b border-border bg-muted/20 py-10 lg:py-14">
      <div className="container">
        <SectionHeader
          title="Direct Authorized Partners"
          description="All components include official Indian manufacturer warranty and service center support across Gujarat."
          align="center"
        />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BRANDS.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brand=${brand.id}`}
              className="group flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4 text-center hover:border-foreground/40 transition-colors min-h-[76px]"
            >
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {brand.name}
              </span>
              <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                Authorized
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
