import { SearchResults } from "@/components/store/search-results";

export const metadata = {
  title: "Search",
  description: "Search Ranuja for processors, graphics cards, RAM, SSDs, and more.",
};

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";

  return <SearchResults query={query} />;
}
