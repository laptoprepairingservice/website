import { SearchResults } from "@/components/store/search-results";
import { fetchStoreCategories, fetchStoreProducts } from "@/lib/supabase/store-data";

export const metadata = {
  title: "Search",
  description: "Search Ranuja for processors, graphics cards, RAM, SSDs, and more.",
};

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";

  const [productsResult, categories] = await Promise.all([
    query ? fetchStoreProducts({ search: query }) : Promise.resolve({ products: [] }),
    fetchStoreCategories(),
  ]);

  return (
    <SearchResults
      query={query}
      products={productsResult.products || []}
      categories={categories || []}
    />
  );
}
