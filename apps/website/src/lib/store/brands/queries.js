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
