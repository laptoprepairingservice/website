import { createClient } from "@/lib/supabase/server";

export async function getCatalogOptions() {
  const supabase = await createClient();

  const [categoriesResult, brandsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("brands").select("id, name").order("name", { ascending: true }),
  ]);

  if (categoriesResult.error) {
    throw categoriesResult.error;
  }

  if (brandsResult.error) {
    throw brandsResult.error;
  }

  return {
    categories: categoriesResult.data ?? [],
    brands: brandsResult.data ?? [],
  };
}
