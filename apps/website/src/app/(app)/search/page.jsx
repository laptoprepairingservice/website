import { SearchResults } from "@/app/(app)/search/_components/search-results";
import {
  fetchRelatedSearchProducts,
  fetchStoreCategoriesWithCount,
  fetchStoreProducts,
} from "@/lib/store";

// export async function generateMetadata({ searchParams }) {
//   const params = await searchParams;
//   const q = params?.q ? `"${params.q}"` : "Hardware & PC Components";
//   return {
//     title: `Search: ${q} | Ranuja Electronics`,
//     description: `Explore search results, specifications, and related components for ${q}.`,
//   };
// }

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = (params?.q || "").trim();
  const currentCategory = params?.category || "";
  const currentSort = params?.sort || "relevance";

  const [products, categories, potentialRelated] = await Promise.all([
    query || currentCategory
      ? fetchStoreProducts({
          search: query || null,
          category: currentCategory || null,
          sort: currentSort !== "relevance" ? currentSort : null,
          limit: 48,
        })
      : fetchStoreProducts({ limit: 24 }),
    fetchStoreCategoriesWithCount(),
    fetchRelatedSearchProducts({ limit: 8 }),
  ]);

  // Exclude products that are already displayed in main search results
  const displayedIds = new Set((products || []).map((p) => p.id));
  const relatedProducts = (potentialRelated || [])
    .filter((p) => !displayedIds.has(p.id))
    .slice(0, 4);

  return (
    <SearchResults
      query={query}
      currentCategory={currentCategory}
      currentSort={currentSort}
      products={products || []}
      categories={categories || []}
      relatedProducts={relatedProducts}
    />
  );
}
