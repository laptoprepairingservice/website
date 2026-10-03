import { fetchStoreCategoryTree } from "@/lib/store";
import { BestSellerSection, LatestBlogsSection } from "./_components";
import { BottomSectionsWrapper } from "./_components/layout/bottom-sections-wrapper";
import { Footer } from "./_components/layout/footer";
import { Header } from "./_components/layout/header";

export default async function AppLayout({ children }) {
  const categories = await fetchStoreCategoryTree();

  return (
    <div className="flex min-h-svh flex-col">
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <BottomSectionsWrapper
        bestSellerSection={<BestSellerSection />}
        latestBlogsSection={<LatestBlogsSection />}
      />
      <Footer />
    </div>
  );
}

