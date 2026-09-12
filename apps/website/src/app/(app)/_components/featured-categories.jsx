import Link from "next/link";
import Image from "next/image";
import { SectionHeader } from "./section-header";

export function FeaturedCategories({ categories = [] }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-border py-10 lg:py-14">
      <div className="container">
        <SectionHeader
          title="Shop by Category"
          description="Browse computer hardware components and build accessories."
          href="/products"
          linkText="All Categories"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id || cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group rounded-xl border border-border bg-card p-4 hover:border-foreground/40 transition-colors"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted/20">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover"
                />
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cat.count} Product{cat.count === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
