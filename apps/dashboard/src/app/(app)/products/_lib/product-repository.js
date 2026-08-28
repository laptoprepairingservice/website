export async function fetchProductWithDefaultVariant(supabase, productId) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      category_id,
      brand_id,
      short_description,
      description,
      sku,
      is_oem,
      status,
      is_featured,
      meta_title,
      meta_description,
      product_variants (
        id,
        sku,
        barcode,
        variant_name,
        condition,
        price,
        compare_at_price,
        cost_price,
        weight_grams,
        is_default,
        is_active
      )
    `
    )
    .eq("id", productId)
    .single();

  if (error) {
    return { product: null, defaultVariant: null, error };
  }

  const variants = data.product_variants ?? [];
  const defaultVariant =
    variants.find((variant) => variant.is_default) ?? variants[0] ?? null;

  const { product_variants: _variants, ...product } = data;

  return { product, defaultVariant, error: null };
}

export async function insertProduct(supabase, payload) {
  return supabase.from("products").insert(payload).select("id").single();
}

export async function insertDefaultVariant(supabase, payload) {
  return supabase.from("product_variants").insert(payload).select("id").single();
}

export async function updateProductById(supabase, productId, payload) {
  return supabase.from("products").update(payload).eq("id", productId).select("id").single();
}

export async function updateVariantById(supabase, variantId, payload) {
  return supabase
    .from("product_variants")
    .update(payload)
    .eq("id", variantId)
    .select("id")
    .single();
}

export async function deleteProductById(supabase, productId) {
  return supabase.from("products").delete().eq("id", productId);
}

export function formatSupabaseError(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage;
  }

  if (error.code === "23505") {
    if (error.message?.includes("products_slug")) {
      return "A product with this slug already exists.";
    }
    if (error.message?.includes("sku")) {
      return "This SKU is already in use.";
    }
    return "A unique field value is already in use.";
  }

  return error.message || fallbackMessage;
}
