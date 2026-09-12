import { createClient } from "@/lib/supabase/server";
import { mapSupabaseProduct } from "@/lib/supabase/store-data";

/**
 * Fetches the active user's saved wishlist products from Supabase.
 */
export async function getCurrentUserWishlistProducts() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: wishlist } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!wishlist?.id) return [];

    const { data: items, error } = await supabase
      .from("wishlist_items")
      .select(`
        id,
        products (
          id,
          public_id,
          name,
          slug,
          short_description,
          description,
          is_featured,
          created_at,
          status,
          categories (id, name, slug),
          brands (id, name, slug),
          product_variants (
            id,
            public_id,
            sku,
            price,
            compare_at_price,
            variant_name,
            is_default,
            is_active,
            options
          ),
          product_images (
            id,
            storage_path,
            sort_order,
            is_banner
          )
        )
      `)
      .eq("wishlist_id", wishlist.id);

    if (error) {
      console.error("Failed to query wishlist items:", error);
      return [];
    }

    return (items || [])
      .map((item) => mapSupabaseProduct(item.products))
      .filter(Boolean);
  } catch (err) {
    console.error("Error fetching wishlist products:", err);
    return [];
  }
}
