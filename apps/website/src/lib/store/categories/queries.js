import { getPublicSupabaseClient } from "@/lib/store/client";
import { mapSupabaseCategory } from "./mapper";

/**
 * Fetches all categories from Supabase with live product counts
 */
export async function fetchStoreCategories() {
  return fetchStoreCategoriesWithCount();
}

/**
 * Fetches all active categories with live product counts from Supabase
 */
export async function fetchStoreCategoriesWithCount() {
  try {
    const supabase = getPublicSupabaseClient();
    const [categoriesRes, productsRes] = await Promise.all([
      supabase
        .from("categories")
        .select("id, public_id, name, slug, image_path, is_active, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("products")
        .select("id, category_id, categories(slug)")
        .eq("status", "active"),
    ]);

    const counts = {};
    (productsRes.data || []).forEach((p) => {
      const slug = p.categories?.slug;
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    });

    return (categoriesRes.data || [])
      .map((cat) => mapSupabaseCategory(cat, counts[cat.slug] || 0))
      .filter(Boolean);
  } catch (err) {
    console.error("Failed to fetch store categories with count:", err);
    return [];
  }
}
