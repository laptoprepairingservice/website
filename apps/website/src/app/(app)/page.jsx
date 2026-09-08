import { OrganizationJsonLd } from "@/components/store/structured-data";
import { Newsletter } from "@/components/store/newsletter";
import {
  CustomerReviews,
  FeaturedCategories,
  FlashDealsSection,
  HardwareFAQSection,
  HeroBanner,
  InteractivePCBuilderWidget,
  InteractiveProductShowcase,
  MobileCategoryPills,
  PopularBrands,
  PromotionalBanner,
  WhyChooseUs,
} from "./_components";

export const metadata = {
  title: "Premium Computer Hardware Store in Ahmedabad | Ranuja Enterprise",
  description:
    "Shop genuine processors, RTX graphics cards, motherboards, DDR5 RAM, NVMe SSDs, monitors and esports peripherals. Same-day dispatch across Gujarat.",
  keywords: [
    "Computer Hardware Ahmedabad",
    "RTX 4090 Ahmedabad",
    "Ryzen 9 Gujarat",
    "Custom PC Build Ahmedabad",
    "Gaming PC Store Gujarat",
    "NVMe SSD Ahmedabad",
    "Genuine PC Components",
  ],
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <OrganizationJsonLd />
      
      {/* 1. Hero Hardware Showcase */}
      <HeroBanner />

      {/* 2. Mobile Category Quick Navigation */}
      <MobileCategoryPills />

      {/* 3. Core Value & Trust Propositions */}
      <WhyChooseUs />

      {/* 4. Limited-Time Hardware Deals */}
      <FlashDealsSection />

      {/* 5. Component Categories */}
      <FeaturedCategories />

      {/* 6. Featured Product Showcase */}
      <InteractiveProductShowcase />

      {/* 7. Custom PC Configurator */}
      <InteractivePCBuilderWidget />

      {/* 8. Hardware Promotional Banners */}
      <PromotionalBanner />

      {/* 9. Authorized Brand Partners */}
      <PopularBrands />

      {/* 10. Verified Customer Reviews */}
      <CustomerReviews />

      {/* 11. Hardware FAQ & Support */}
      <HardwareFAQSection />

      {/* 12. Newsletter Subscription */}
      <Newsletter />
    </div>
  );
}
