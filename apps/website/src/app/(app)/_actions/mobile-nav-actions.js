"use server";

import { fetchStoreCategoryTree } from "@/lib/store";
import { fetchStoreProducts } from "@/lib/store/products/queries";

/**
 * Server Action: Fetches active categories organized in a 1-level deep hierarchy.
 */
export async function getNavCategoriesAction() {
  try {
    return await fetchStoreCategoryTree();
  } catch (error) {
    console.error("getNavCategoriesAction error:", error);
    return [];
  }
}

/**
 * Server Action: Fetches a compact product list for a given category slug.
 * Used in the desktop mega-menu when a category has no subcategories.
 */
export async function getCategoryProductsAction(categorySlug) {
  try {
    if (!categorySlug) return [];
    const products = await fetchStoreProducts({ category: categorySlug, limit: 12 });
    // Return only the fields needed by the nav panel
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      categorySlug: p.category,
      brandSlug: p.brandSlug,
      price: p.price,
      image: p.image ?? null,
    }));
  } catch (error) {
    console.error("getCategoryProductsAction error:", error);
    return [];
  }
}
