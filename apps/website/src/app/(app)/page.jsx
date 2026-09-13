import { OrganizationJsonLd } from "@/app/(app)/products/[slug]/_components/structured-data";
import { Newsletter } from "@/components/store/newsletter";
import { fetchStoreHomeData } from "@/lib/store";
import {
  HardwareFAQSection,
  HeroBanner,
  InteractiveProductShowcase,
  MobileCategoryPills,
  PopularBrands,
  WhyChooseUs,
} from "./_components";

export const metadata = {
  title: "Premium Computer Hardware Store in Ahmedabad | Ranuja Enterprise",
  description:
    "Shop genuine computer components, hardware, and peripherals. Official manufacturer warranty and same-day Gujarat dispatch.",
  keywords: [
    "Computer Hardware Ahmedabad",
    "Computer Components Gujarat",
    "Hardware Store Ahmedabad",
    "Genuine PC Components",
  ],
};

export const revalidate = 60;

export default async function HomePage() {
  const { categories, brands, products, featuredProduct } = await fetchStoreHomeData();

  return (
    <div className="flex flex-col">
      <OrganizationJsonLd />

      {/* 1. Hero Hardware Showcase */}
      <HeroBanner featuredProduct={featuredProduct} />

      {/* 2. Mobile Category Quick Navigation */}
      <MobileCategoryPills categories={categories} />

      {/* 3. Core Value & Trust Propositions */}
      <WhyChooseUs />

      {/* 5. Featured Product Showcase (Live Supabase) */}
      <InteractiveProductShowcase categories={categories} products={products} />

      {/* 6. Authorized Brand Partners (Live Supabase) */}
      <PopularBrands brands={brands} />

      {/* 7. Hardware FAQ & Support */}
      <HardwareFAQSection />

      {/* 8. Newsletter Subscription */}
      <Newsletter />
    </div>
  );
}
