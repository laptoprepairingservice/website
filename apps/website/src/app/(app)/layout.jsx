import { fetchStoreCategoriesWithCount } from "@/lib/supabase/store-data";
import { Footer } from "./_components/layout/footer";
import { Header } from "./_components/layout/header";

export default async function AppLayout({ children }) {
  const categories = await fetchStoreCategoriesWithCount();

  return (
    <div className="flex min-h-svh flex-col">
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
