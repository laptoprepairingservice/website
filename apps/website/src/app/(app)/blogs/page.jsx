import { fetchBlogCategories } from "@/lib/blog";
import { BlogsClient } from "./_components/blogs-client";

export const revalidate = 60;

export const metadata = {
  title: "Blog | Ranuja",
  description:
    "Read our latest articles, guides, and tips on laptops, PC components, repairs, and tech upgrades.",
};

/**
 * Blog listing page.
 * Server component: fetches static category list for filter chips,
 * then delegates all data fetching + pagination to the ReactList client component.
 */
export default async function BlogsPage() {
  const categories = await fetchBlogCategories();

  return <BlogsClient categories={categories} />;
}
