import { CategoryMarquee } from "./category-swiper";
import { SectionHeader } from "./section-header";

export function FeaturedCategories({ categories = [], brands = [] }) {
  if (!categories.length && !brands.length) return null;

  return (
    <section className="border-border bg-pattern border-b py-10 lg:py-14">
      <div className="container">
        <SectionHeader
          title="Shop by Category"
          description="Browse computer hardware components and build accessories."
          href={`/${brands[0]?.slug}/${categories[0]?.slug}/`}
          linkText="All Categories"
        />

        {/* JS RAF infinite auto-scroll — only serializable data crosses the boundary */}
        <CategoryMarquee categories={categories} speed={0.6} gap={12} />
      </div>
    </section>
  );
}
