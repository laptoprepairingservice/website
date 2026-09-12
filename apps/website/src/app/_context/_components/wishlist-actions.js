"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWishlist } from "@/lib/wishlist";

/**
 * Gets or creates the user's default wishlist.
 */
async function getOrCreateUserWishlistId(supabase, userId) {
  // Check for existing default wishlist
  const { data: defaultWishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  if (defaultWishlist?.id) {
    return defaultWishlist.id;
  }

  // Fallback to any existing wishlist
  const { data: anyWishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (anyWishlist?.id) {
    return anyWishlist.id;
  }

  // Create new default wishlist
  const { data: newWishlist, error } = await supabase
    .from("wishlists")
    .insert({
      user_id: userId,
      name: "My Wishlist",
      is_default: true,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create wishlist:", error);
    return null;
  }

  return newWishlist?.id || null;
}

/**
 * Server Action: Add a product to authenticated user's wishlist.
 */
export async function addToWishlistAction(productId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.is_anonymous) {
      return {
        success: false,
        error: "Authentication required",
        requiresAuth: true,
      };
    }

    const numericProductId = Number(productId);
    if (!numericProductId) {
      return { success: false, error: "Invalid product ID" };
    }

    const wishlistId = await getOrCreateUserWishlistId(supabase, user.id);
    if (!wishlistId) {
      return { success: false, error: "Failed to locate or create wishlist" };
    }

    const { data: existing } = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("wishlist_id", wishlistId)
      .eq("product_id", numericProductId)
      .maybeSingle();

    if (!existing) {
      const { error: insertError } = await supabase
        .from("wishlist_items")
        .insert({
          wishlist_id: wishlistId,
          product_id: numericProductId,
        });

      if (insertError && insertError.code !== "23505") {
        throw insertError;
      }
    }

    return {
      success: true,
      action: "added",
      wishlist: await getCurrentUserWishlist(user.id),
    };
  } catch (error) {
    console.error("addToWishlistAction error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Remove a product from authenticated user's wishlist.
 */
export async function removeFromWishlistAction(productId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.is_anonymous) {
      return {
        success: false,
        error: "Authentication required",
        requiresAuth: true,
      };
    }

    const numericProductId = Number(productId);
    if (!numericProductId) {
      return { success: false, error: "Invalid product ID" };
    }

    const wishlistId = await getOrCreateUserWishlistId(supabase, user.id);
    if (!wishlistId) {
      return { success: false, error: "Failed to locate wishlist" };
    }

    const { error: deleteError } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("wishlist_id", wishlistId)
      .or(`product_id.eq.${numericProductId},id.eq.${numericProductId}`);

    if (deleteError) {
      throw deleteError;
    }

    return {
      success: true,
      action: "removed",
      wishlist: await getCurrentUserWishlist(user.id),
    };
  } catch (error) {
    console.error("removeFromWishlistAction error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Toggle product in user's wishlist (Add if absent, remove if present).
 */
export async function toggleWishlistAction(productId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.is_anonymous) {
      return {
        success: false,
        error: "Authentication required",
        requiresAuth: true,
      };
    }

    const numericProductId = Number(productId);
    if (!numericProductId) {
      return { success: false, error: "Invalid product ID" };
    }

    const wishlistId = await getOrCreateUserWishlistId(supabase, user.id);
    if (!wishlistId) {
      return { success: false, error: "Failed to locate or create wishlist" };
    }

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("wishlist_id", wishlistId)
      .eq("product_id", numericProductId)
      .maybeSingle();

    if (existing) {
      // Remove
      await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", existing.id);

      return {
        success: true,
        action: "removed",
        wishlist: await getCurrentUserWishlist(user.id),
      };
    } else {
      // Add
      const { error: insertError } = await supabase
        .from("wishlist_items")
        .insert({
          wishlist_id: wishlistId,
          product_id: numericProductId,
        });

      if (insertError && insertError.code !== "23505") {
        throw insertError;
      }

      return {
        success: true,
        action: "added",
        wishlist: await getCurrentUserWishlist(user.id),
      };
    }
  } catch (error) {
    console.error("toggleWishlistAction error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Clear all items in user's wishlist.
 */
export async function clearUserWishlistAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.is_anonymous) {
      return {
        success: false,
        error: "Authentication required",
        requiresAuth: true,
      };
    }

    const wishlistId = await getOrCreateUserWishlistId(supabase, user.id);
    if (!wishlistId) {
      return { success: true, wishlist: { id: null, items: [] } };
    }

    await supabase
      .from("wishlist_items")
      .delete()
      .eq("wishlist_id", wishlistId);

    return {
      success: true,
      wishlist: { id: wishlistId, items: [] },
    };
  } catch (error) {
    console.error("clearUserWishlistAction error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Re-fetch current user's wishlist.
 */
export async function getCurrentUserWishlistAction() {
  return getCurrentUserWishlist();
}
