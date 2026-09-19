import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { SectionHeader } from "./section-header";
import { cn } from "@/lib/utils";

function CategoryCell({ category, className }) {
  return (
    <Link
      href={`/${category.slug}`}
      className={cn(
        "group bg-muted relative overflow-hidden rounded-2xl",
        "ring-border/60 ring-1 transition-all duration-300",
        "hover:shadow-lg",
        className
      )}
    >
      {category.image ? (
        <Image
          src={category.image}
          alt={category.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="bg-muted absolute inset-0 flex items-center justify-center">
          <span className="text-muted-foreground/20 text-3xl font-bold uppercase">
            {category.name.slice(0, 2)}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

      <div
        className={cn(
          "absolute top-4 right-4 z-20 flex size-10 items-center justify-center",
          "rounded-full bg-white/90 text-gray-900 shadow-md backdrop-blur-sm",
          "scale-90 opacity-0 transition-all duration-300",
          "group-hover:scale-100 group-hover:opacity-100"
        )}
      >
        <ArrowUpRight className="size-5" strokeWidth={1.8} />
      </div>

      <div className="absolute bottom-3 left-3 z-20">
        <span className="inline-flex items-center rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur-sm">
          {category.name}

          {category.count != null && (
            <span className="ml-1.5 font-normal text-gray-500">({category.count})</span>
          )}
        </span>
      </div>
    </Link>
  );
}

function CategoryLayout({ categories }) {
  const items = categories.slice(0, 9);

  return (
    <div className="grid h-105 w-full shrink-0 grid-cols-12 grid-rows-2 gap-3 sm:gap-4">
      {items[0] && <CategoryCell category={items[0]} className="col-span-4 row-span-1" />}

      {items[1] && <CategoryCell category={items[1]} className="col-span-2 row-span-1" />}

      {items[2] && <CategoryCell category={items[2]} className="col-span-2 row-span-1" />}

      {items[3] && <CategoryCell category={items[3]} className="col-span-4 row-span-1" />}

      {items[4] && <CategoryCell category={items[4]} className="col-span-2 row-span-1" />}

      {items[5] && <CategoryCell category={items[5]} className="col-span-2 row-span-1" />}

      {items[6] && <CategoryCell category={items[6]} className="col-span-4 row-span-1" />}

      {items[7] && <CategoryCell category={items[7]} className="col-span-2 row-span-1" />}

      {items[8] && <CategoryCell category={items[8]} className="col-span-2 row-span-1" />}
    </div>
  );
}

export function FeaturedCategories({ categories = [] }) {
  if (!categories.length) {
    return null;
  }

  const chunks = [];

  for (let i = 0; i < categories.length; i += 9) {
    chunks.push(categories.slice(i, i + 9));
  }

  return (
    <section className="border-border border-b py-10 lg:py-14">
      <div className="container">
        <SectionHeader
          title="Shop by Category"
          description="Browse computer hardware components and build accessories."
          href={categories[0]?.slug ? `/${categories[0].slug}` : "/"}
          linkText="All Categories"
        />

        <div className="hide-scrollbar -mx-1 overflow-x-auto px-1">
          <div className="flex w-max gap-4">
            {chunks.map((chunk, index) => (
              <div
                key={index}
                className="w-[calc(100vw-2rem)] max-w-300 shrink-0 lg:w-[calc(100vw-4rem)]"
              >
                <CategoryLayout categories={chunk} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
