import { createClient } from "@/lib/supabase/server";
import { mapSupabaseProduct } from "@/lib/store";

/**
 * Server-side helper to fetch the authenticated user's wishlist from Supabase.
 * Mirrors getCurrentUserCart structure.
 */
export async function getCurrentUserWishlist(userId = null) {
  try {
    const supabase = await createClient();

    let targetUserId = userId;
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      targetUserId = user?.id || null;
    }

    if (!targetUserId) {
      return { id: null, items: [] };
    }

    // 1. Fetch user default wishlist
    let { data: wishlist, error: wishlistError } = await supabase
      .from("wishlists")
      .select("id, user_id, updated_at")
      .eq("user_id", targetUserId)
      .eq("is_default", true)
      .maybeSingle();

    if (wishlistError) {
      console.error("Error fetching user wishlist:", wishlistError);
    }

    // Fallback: any wishlist for this user if no default is flagged
    if (!wishlist) {
      const { data: anyWishlist } = await supabase
        .from("wishlists")
        .select("id, user_id, updated_at")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      wishlist = anyWishlist;
    }

    // If no wishlist exists, initialize the default wishlist row
    if (!wishlist) {
      const { data: newWishlist, error: createError } = await supabase
        .from("wishlists")
        .insert({
          user_id: targetUserId,
          name: "My Wishlist",
          is_default: true,
        })
        .select("id, user_id, updated_at")
        .maybeSingle();

      if (createError) {
        console.warn("Could not create initial wishlist row:", createError.message);
      } else {
        wishlist = newWishlist;
      }
    }

    if (!wishlist?.id) {
      return { id: null, items: [] };
    }

    // 2. Fetch wishlist items with relations
    const { data: items, error: itemsError } = await supabase
      .from("wishlist_items")
      .select(
        `
        id,
        wishlist_id,
        product_id,
        created_at,
        products (
          id,
          public_id,
          name,
          slug,
          short_description,
          description,
          is_featured,
          is_bestseller,
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
      `
      )
      .eq("wishlist_id", wishlist.id)
      .order("created_at", { ascending: false });

    if (itemsError) {
      console.error("Error fetching wishlist items:", itemsError);
      return { id: wishlist.id, items: [] };
    }

    // 3. Normalize items
    const normalizedItems = (items || [])
      .map((item) => {
        const product = mapSupabaseProduct(item.products);
        if (!product) return null;

        return {
          id: String(item.id),
          wishlistItemId: item.id,
          wishlistId: item.wishlist_id,
          productId: product.id,
          product,
          ...product,
        };
      })
      .filter(Boolean);

    return {
      id: wishlist.id,
      items: normalizedItems,
    };
  } catch (err) {
    console.error("Unexpected error in getCurrentUserWishlist:", err);
    return { id: null, items: [] };
  }
}

/**
 * Fetches the active user's saved wishlist products from Supabase.
 * Backward-compatible helper for server pages.
 */
export async function getCurrentUserWishlistProducts(userId = null) {
  const wishlist = await getCurrentUserWishlist(userId);
  return (wishlist?.items || []).map((item) => item.product || item);
}
