import { getPublicSupabaseClient } from "@/lib/store/client";

const DEFAULT_ITEM_WEIGHT_GRAMS = 350; // Standard hardware item weight fallback (0.35kg)
const MIN_PACKAGE_WEIGHT_KG = 0.5; // Shiprocket standard minimum billable weight

/**
 * Calculates authoritative total package weight on the server from cart items.
 * Fetches the physical weight_grams recorded on product variants in Supabase.
 *
 * @param {Array<{ variantId?: string|number, id?: string|number, quantity?: number }>} cartItems
 * @returns {Promise<number>} Package weight in kilograms (minimum 0.5kg)
 */
export async function calculateCartWeight(cartItems = []) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return MIN_PACKAGE_WEIGHT_KG;
  }

  const variantIds = cartItems
    .map((item) => item?.variantId || item?.id)
    .filter(Boolean);

  let variantWeightMap = new Map();

  if (variantIds.length > 0) {
    try {
      const supabase = getPublicSupabaseClient();
      const { data } = await supabase
        .from("product_variants")
        .select("id, weight_grams")
        .in("id", variantIds);

      if (Array.isArray(data)) {
        data.forEach((v) => {
          if (v?.id != null) {
            variantWeightMap.set(
              String(v.id),
              Number(v.weight_grams) > 0 ? Number(v.weight_grams) : DEFAULT_ITEM_WEIGHT_GRAMS
            );
          }
        });
      }
    } catch (err) {
      console.warn("Could not fetch variant weights from DB, using fallback weight:", err);
    }
  }

  let totalGrams = 0;
  for (const item of cartItems) {
    const vId = String(item?.variantId || item?.id || "");
    const qty = Math.max(1, Number(item?.quantity) || 1);
    const itemGrams = variantWeightMap.get(vId) || DEFAULT_ITEM_WEIGHT_GRAMS;
    totalGrams += itemGrams * qty;
  }

  const totalKg = totalGrams / 1000;
  return Math.max(MIN_PACKAGE_WEIGHT_KG, Number(totalKg.toFixed(2)));
}
