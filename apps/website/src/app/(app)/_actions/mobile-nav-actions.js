"use server";

import {
  fetchStoreCategoriesWithCount,
  fetchCategoryProducts,
} from "@/lib/supabase/store-data";

/**
 * Server Action: Fetches active categories with image and live product counts.
 */
export async function getNavCategoriesAction() {
  try {
    return await fetchStoreCategoriesWithCount();
  } catch (error) {
    console.error("getNavCategoriesAction error:", error);
    return [];
  }
}

/**
 * Server Action: Fetches up to 20 active products for a category.
 */
export async function getCategoryProductsAction(categorySlug) {
  try {
    return await fetchCategoryProducts(categorySlug, 20);
  } catch (error) {
    console.error("getCategoryProductsAction error:", error);
    return [];
  }
}
