"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserCart } from "@/lib/cart";

/**
 * Gets or creates the user's cart using an atomic upsert on user_id.
 */
async function getOrCreateUserCartId(supabase, userId) {
  const { data, error } = await supabase
    .from("carts")
    .upsert(
      { user_id: userId },
      { onConflict: "user_id", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (error) {
    console.error("Failed to get/create cart:", error);
    // Fallback lookup
    const { data: existing } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    return existing?.id || null;
  }

  return data?.id || null;
}

/**
 * Server Action: Atomically add or increment a variant in the authenticated user's cart.
 */
export async function addToCartAction(variantId, quantity = 1) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const numericVariantId = Number(variantId);
    const qty = Math.max(1, Math.min(999, Number(quantity) || 1));

    if (!numericVariantId) {
      return { success: false, error: "Invalid variant ID" };
    }

    const cartId = await getOrCreateUserCartId(supabase, user.id);
    if (!cartId) {
      return { success: false, error: "Failed to create or locate cart" };
    }

    // 1. Call atomic PostgreSQL RPC
    const { error: rpcError } = await supabase.rpc("add_or_increment_cart_item", {
      p_cart_id: cartId,
      p_variant_id: numericVariantId,
      p_quantity: qty,
    });

    if (rpcError) {
      // 2. Direct fallback with unique constraint protection
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("variant_id", numericVariantId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("cart_items")
          .update({
            quantity: Math.min(999, (existing.quantity || 0) + qty),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        const { error: insertError } = await supabase.from("cart_items").insert({
          cart_id: cartId,
          variant_id: numericVariantId,
          quantity: qty,
        });

        // If duplicate insert race occurred, update the existing row
        if (insertError?.code === "23505") {
          const { data: duplicateItem } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("cart_id", cartId)
            .eq("variant_id", numericVariantId)
            .single();

          if (duplicateItem) {
            await supabase
              .from("cart_items")
              .update({
                quantity: Math.min(999, (duplicateItem.quantity || 0) + qty),
                updated_at: new Date().toISOString(),
              })
              .eq("id", duplicateItem.id);
          }
        } else if (insertError) {
          throw insertError;
        }
      }
    }

    return {
      success: true,
      cart: await getCurrentUserCart(user.id),
    };
  } catch (error) {
    console.error("addToCartAction error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Update the quantity of a cart item.
 */
export async function updateCartQuantityAction(cartItemId, quantity) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const numericItemId = Number(cartItemId);
    if (!numericItemId) {
      return { success: false, error: "Invalid cart item ID" };
    }

    if (quantity <= 0) {
      return removeCartItemAction(numericItemId);
    }

    const { error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity: Math.min(999, Math.max(1, quantity)),
        updated_at: new Date().toISOString(),
      })
      .eq("id", numericItemId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return {
      success: true,
      cart: await getCurrentUserCart(user.id),
    };
  } catch (error) {
    console.error("updateCartQuantityAction error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Remove a cart item.
 */
export async function removeCartItemAction(cartItemId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const numericItemId = Number(cartItemId);
    if (!numericItemId) {
      return { success: false, error: "Invalid cart item ID" };
    }

    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", numericItemId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return {
      success: true,
      cart: await getCurrentUserCart(user.id),
    };
  } catch (error) {
    console.error("removeCartItemAction error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Clear all items in user's cart.
 */
export async function clearUserCartAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const cartId = await getOrCreateUserCartId(supabase, user.id);
    if (!cartId) return { success: true, cart: { id: null, items: [] } };

    await supabase.rpc("clear_user_cart", { p_cart_id: cartId });

    return {
      success: true,
      cart: { id: cartId, items: [] },
    };
  } catch (error) {
    console.error("clearUserCartAction error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Re-fetch current user's cart.
 */
export async function getCurrentUserCartAction() {
  return getCurrentUserCart();
}

/**
 * Server Action: Atomically synchronize guest items into Supabase cart on login.
 */
export async function syncGuestCartAction(guestItems = []) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !Array.isArray(guestItems) || guestItems.length === 0) {
      return { success: true, cart: null };
    }

    const cartId = await getOrCreateUserCartId(supabase, user.id);
    if (!cartId) {
      return { success: false, error: "Could not create or locate cart" };
    }

    for (const item of guestItems) {
      const variantId = Number(item.variantId);
      const quantity = Math.max(1, Math.min(999, Number(item.quantity) || 1));
      if (!variantId) continue;

      // Use atomic RPC for each guest item
      await supabase.rpc("add_or_increment_cart_item", {
        p_cart_id: cartId,
        p_variant_id: variantId,
        p_quantity: quantity,
      });
    }

    return {
      success: true,
      cart: await getCurrentUserCart(user.id),
    };
  } catch (error) {
    console.error("syncGuestCartAction error:", error);
    return { success: false, error: error.message };
  }
}
