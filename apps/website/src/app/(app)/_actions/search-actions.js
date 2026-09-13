"use server";

import { searchStoreLive } from "@/lib/store";

/**
 * Server Action: Fast live search for combobox dropdown.
 * Returns matching products, matching categories, and total match count.
 */
export async function liveSearchAction(query) {
  try {
    if (!query || typeof query !== "string") {
      return { products: [], categories: [], totalCount: 0 };
    }

    const trimmed = query.trim();
    if (!trimmed) {
      return { products: [], categories: [], totalCount: 0 };
    }

    // Limit to 5 top products and 4 matching categories for the combobox dropdown
    return await searchStoreLive({ query: trimmed, limit: 5 });
  } catch (error) {
    console.error("liveSearchAction error:", error);
    return { products: [], categories: [], totalCount: 0, error: error.message };
  }
}
