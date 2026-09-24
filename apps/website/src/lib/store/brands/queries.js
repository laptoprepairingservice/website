import { getPublicSupabaseClient } from "@/lib/store/client";
import { mapSupabaseBrand } from "./mapper";

/**
 * Fetches all active brands from Supabase
 */
export async function fetchStoreBrands() {
  try {
    const supabase = getPublicSupabaseClient();
    const { data: brands, error } = await supabase
      .from("brands")
      .select("id, public_id, name, slug, logo_path, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching store brands:", error);
      return [];
    }

    return (brands || []).map(mapSupabaseBrand).filter(Boolean);
  } catch (err) {
    console.error("Failed to fetch store brands:", err);
    return [];
  }
}

/**
 * Fetches a single brand by slug from Supabase
 */
export async function fetchBrandBySlug(slug) {
  if (!slug) return null;
  try {
    const supabase = getPublicSupabaseClient();
    const { data: brand, error } = await supabase
      .from("brands")
      .select("id, public_id, name, slug, logo_path, description, is_active")
      .eq("slug", slug.toLowerCase())
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Error fetching brand by slug:", error);
      return null;
    }

    return brand ? mapSupabaseBrand(brand) : null;
  } catch (err) {
    console.error("Failed to fetch brand by slug:", err);
    return null;
  }
}
