"use server";

import { fetchStoreCategoryTree } from "@/lib/store";

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
