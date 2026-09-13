import { fetchStoreCategoryTree } from "@/lib/store";
import { Footer } from "./_components/layout/footer";
import { Header } from "./_components/layout/header";

export default async function AppLayout({ children }) {
  const categories = await fetchStoreCategoryTree();

  return (
    <div className="flex min-h-svh flex-col">
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
