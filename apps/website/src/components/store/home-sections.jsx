import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, Headphones, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/store/product-card";
import { StarRating } from "@/components/store/star-rating";
import {
  BRANDS,
  CATEGORIES,
  REVIEWS,
  getBestSellers,
  getFeaturedProducts,
  getRecentlyAdded,
} from "@/lib/data/products";

const WHY_CHOOSE = [
  {
    icon: Shield,
    title: "100% Genuine Products",
    description: "Authorized dealer with manufacturer warranty on every product.",
  },
  {
    icon: Truck,
    title: "Fast Gujarat Delivery",
    description: "Same-day dispatch from Ahmedabad. Free shipping above ₹5,000.",
  },
  {
    icon: Headphones,
    title: "Expert PC Support",
    description: "Our technicians help you choose compatible components.",
  },
  {
    icon: Award,
    title: "Trusted Since 2015",
    description: "10,000+ satisfied customers across Ahmedabad and Gujarat.",
  },
];

function SectionHeader({ title, description, href, linkText = "View All" }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
        {description && <p className="text-muted-foreground mt-2">{description}</p>}
      </div>
      {href && (
        <Button variant="ghost" asChild className="self-start sm:self-auto">
          <Link href={href}>
            {linkText}
            <ArrowRight />
          </Link>
        </Button>
      )}
    </div>
  );
}

export function HeroBanner() {
  return (
    <section className="bg-muted/40 relative overflow-hidden">
      <div className="container-store">
        <div className="grid min-h-[480px] items-center gap-8 py-12 lg:grid-cols-2 lg:py-16">
          <div className="space-y-6">
            <span className="border-border bg-background inline-flex rounded-full border px-4 py-1.5 text-xs font-medium">
              Premium Hardware · Ahmedabad
            </span>
            <h1 className="text-4xl leading-tight font-semibold tracking-tight md:text-5xl lg:text-6xl">
              Build Your Dream PC with Confidence
            </h1>
            <p className="text-muted-foreground max-w-lg text-lg">
              Genuine processors, graphics cards, and components from top brands. Expert guidance
              and fast delivery across Gujarat.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/products">
                  Shop Components
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-square max-h-[420px] justify-self-center lg:max-h-none">
            <Image
              src="https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&h=800&fit=crop"
              alt="High-performance gaming PC components"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedCategories() {
  return (
    <section className="section-padding">
      <div className="container-store">
        <SectionHeader
          title="Shop by Category"
          description="Find the perfect components for your build"
          href="/products"
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {CATEGORIES.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="group card-interactive overflow-hidden"
            >
              <div className="bg-muted/30 relative aspect-[4/3] overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium">{cat.name}</h3>
                <p className="text-muted-foreground text-xs">{cat.count} products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PopularBrands() {
  return (
    <section className="border-border bg-muted/20 border-y py-12">
      <div className="container-store">
        <h2 className="text-muted-foreground mb-8 text-center text-sm font-semibold tracking-wider uppercase">
          Authorized Brands
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {BRANDS.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brand=${brand.id}`}
              className="text-muted-foreground hover:text-foreground text-lg font-semibold transition-colors"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProductsSection() {
  return (
    <section className="section-padding">
      <div className="container-store">
        <SectionHeader
          title="Featured Products"
          description="Hand-picked premium components"
          href="/products"
        />
        <ProductGrid products={getFeaturedProducts()} />
      </div>
    </section>
  );
}

export function BestSellersSection() {
  return (
    <section className="section-padding bg-muted/20">
      <div className="container-store">
        <SectionHeader
          title="Best Sellers"
          description="Most popular among our customers"
          href="/products?sort=popular"
        />
        <ProductGrid products={getBestSellers()} />
      </div>
    </section>
  );
}

export function RecentlyAddedSection() {
  const products = getRecentlyAdded();
  if (products.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-store">
        <SectionHeader
          title="Recently Added"
          description="Latest arrivals in our store"
          href="/products?sort=newest"
        />
        <ProductGrid products={products} />
      </div>
    </section>
  );
}

export function PromotionalBanner() {
  return (
    <section className="section-padding">
      <div className="container-store">
        <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-2xl px-8 py-12 md:px-16 md:py-16">
          <div className="relative z-10 max-w-xl">
            <span className="text-sm font-medium opacity-80">Limited Time Offer</span>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
              Up to 15% Off on Storage & Memory
            </h2>
            <p className="mt-4 opacity-80">
              Upgrade your system with Samsung SSDs and Corsair RAM. Offer valid till month end.
            </p>
            <Button size="lg" variant="secondary" className="mt-6" asChild>
              <Link href="/products?category=storage">
                Shop the Sale
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  return (
    <section className="section-padding bg-muted/20">
      <div className="container-store">
        <SectionHeader
          title="Why Choose Ranuja"
          description="Your trusted hardware partner in Ahmedabad"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE.map(({ icon: Icon, title, description }) => (
            <div key={title} className="border-border bg-card rounded-xl border p-6">
              <div className="bg-primary/5 mb-4 flex size-12 items-center justify-center rounded-xl">
                <Icon className="text-primary size-6" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CustomerReviews() {
  return (
    <section className="section-padding">
      <div className="container-store">
        <SectionHeader title="Customer Reviews" description="What our customers say about us" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {REVIEWS.map((review) => (
            <blockquote key={review.id} className="border-border bg-card rounded-xl border p-6">
              <StarRating rating={review.rating} showCount={false} />
              <p className="mt-4 text-sm leading-relaxed">&ldquo;{review.text}&rdquo;</p>
              <footer className="border-border mt-4 border-t pt-4">
                <p className="text-sm font-medium">{review.author}</p>
                <p className="text-muted-foreground text-xs">{review.location}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
