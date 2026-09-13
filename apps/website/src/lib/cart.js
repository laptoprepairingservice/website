import { createClient } from "@/lib/supabase/server";
import { getProductAssetUrl } from "@/lib/store";

/**
 * Server-side helper to fetch the authenticated user's cart from Supabase.
 * Performs deep join with product_variants, products, brands, and product_images.
 */
export async function getCurrentUserCart(userId = null) {
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

    // 1. Fetch user cart
    let { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id, user_id, updated_at")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (cartError) {
      console.error("Error fetching user cart:", cartError);
      return { id: null, items: [] };
    }

    // If no cart exists, attempt to initialize one
    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from("carts")
        .insert({ user_id: targetUserId })
        .select("id, user_id, updated_at")
        .maybeSingle();

      if (createError) {
        // May fail if RLS insert policy is restrictive or race condition occurred
        console.warn("Could not create initial cart row:", createError.message);
      } else {
        cart = newCart;
      }
    }

    if (!cart?.id) {
      return { id: null, items: [] };
    }

    // 2. Fetch cart items with nested variant, product, and image relations
    const { data: items, error: itemsError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        cart_id,
        variant_id,
        quantity,
        created_at,
        updated_at,
        product_variants (
          id,
          product_id,
          price,
          compare_at_price,
          variant_name,
          is_active,
          products (
            id,
            name,
            slug,
            brands (name),
            product_images (
              storage_path,
              is_banner,
              sort_order
            )
          )
        )
      `
      )
      .eq("cart_id", cart.id)
      .order("created_at", { ascending: true });

    if (itemsError) {
      console.error("Error fetching cart items:", itemsError);
      return { id: cart.id, items: [] };
    }

    // 3. Normalize items for clean client consumption
    const normalizedItems = (items || []).map((ci) => {
      const variant = ci.product_variants;
      const product = variant?.products;
      const brand = product?.brands?.name || "Hardware";
      const images = Array.isArray(product?.product_images) ? product.product_images : [];
      const sortedImages = [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      const bannerImg = sortedImages.find((img) => img.is_banner);
      const primaryImg = bannerImg || sortedImages[0];
      const imageUrl = getProductAssetUrl(primaryImg?.storage_path);

      return {
        id: String(ci.id),
        cartItemId: ci.id,
        variantId: ci.variant_id,
        productId: product?.id || null,
        name: product?.name || variant?.variant_name || "Hardware Product",
        slug: product?.slug || "",
        brand,
        price: variant?.price != null ? Number(variant.price) : 0,
        originalPrice: variant?.compare_at_price != null ? Number(variant.compare_at_price) : null,
        quantity: ci.quantity || 1,
        image: imageUrl,
      };
    });

    return {
      id: cart.id,
      items: normalizedItems,
    };
  } catch (err) {
    console.error("Unexpected error in getCurrentUserCart:", err);
    return { id: null, items: [] };
  }
}
