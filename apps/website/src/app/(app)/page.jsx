import { OrganizationJsonLd } from "@/components/store/structured-data";
import { Newsletter } from "@/components/store/newsletter";
import {
  BestSellersSection,
  CustomerReviews,
  FeaturedCategories,
  FeaturedProductsSection,
  HeroBanner,
  PopularBrands,
  PromotionalBanner,
  RecentlyAddedSection,
  WhyChooseUs,
} from "@/components/store/home-sections";

export const metadata = {
  title: "Premium Computer Hardware Store in Ahmedabad",
  description:
    "Shop genuine processors, graphics cards, motherboards, RAM, SSDs, monitors and peripherals. Fast delivery across Gujarat.",
};

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <HeroBanner />
      <FeaturedCategories />
      <PopularBrands />
      <FeaturedProductsSection />
      <BestSellersSection />
      <RecentlyAddedSection />
      <PromotionalBanner />
      <WhyChooseUs />
      <CustomerReviews />
      <Newsletter />
    </>
  );
}
