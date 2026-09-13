import { getPublicSupabaseClient } from "@/lib/store/client";
import { mapSupabaseCategory } from "./mapper";

/**
 * Fetches all categories from Supabase with live product counts
 */
export async function fetchStoreCategories() {
  return fetchStoreCategoriesWithCount();
}

/**
 * Fetches a single category by its slug
 */
export async function fetchCategoryBySlug(slug) {
  if (!slug) return null;
  try {
    const supabase = getPublicSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, public_id, parent_id, name, slug, description, image_path, is_active, sort_order, meta_title, meta_description")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return null;
    return mapSupabaseCategory(data);
  } catch (err) {
    console.error("Failed to fetch category by slug:", err);
    return null;
  }
}

/**
 * Fetches all active categories with live product counts from Supabase
 */
export async function fetchStoreCategoriesWithCount() {
  try {
    const supabase = getPublicSupabaseClient();
    const [categoriesRes, productsRes] = await Promise.all([
      supabase
        .from("categories")
        .select("id, public_id, parent_id, name, slug, image_path, is_active, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("products")
        .select("id, category_id, categories(slug)")
        .eq("status", "active"),
    ]);

    const counts = {};
    (productsRes.data || []).forEach((p) => {
      const slug = p.categories?.slug;
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    });

    return (categoriesRes.data || [])
      .map((cat) => mapSupabaseCategory(cat, counts[cat.slug] || 0))
      .filter(Boolean);
  } catch (err) {
    console.error("Failed to fetch store categories with count:", err);
    return [];
  }
}

/**
 * Organizes a flat list of mapped categories into a 1-level deep hierarchy.
 * Returns only root categories (main categories), each containing a `subcategories` array
 * of its direct children (level 1 depth).
 */
export function buildCategoryTree(categories = []) {
  if (!Array.isArray(categories) || categories.length === 0) return [];

  // Check if categories are already in tree structure
  if (categories.some((c) => Array.isArray(c?.subcategories))) {
    return categories;
  }

  const idMap = new Map();
  categories.forEach((cat) => {
    idMap.set(String(cat.id), { ...cat, subcategories: [] });
  });

  const roots = [];
  const visited = new Set();

  // 1. Direct roots (parentId is null/undefined or parent not found in active categories)
  categories.forEach((cat) => {
    const current = idMap.get(String(cat.id));
    const parentIdStr = cat.parentId != null ? String(cat.parentId) : null;

    if (!parentIdStr || !idMap.has(parentIdStr) || parentIdStr === String(cat.id)) {
      roots.push(current);
      visited.add(String(cat.id));
    } else {
      const parent = idMap.get(parentIdStr);
      parent.subcategories.push(current);
    }
  });

  // 2. Cycle-breaker: if any items were part of an isolated cycle without a null parentId,
  // promote them so no categories are hidden or lost.
  categories.forEach((cat) => {
    const catIdStr = String(cat.id);
    if (!visited.has(catIdStr)) {
      let curr = cat;
      let inTree = false;
      const path = new Set([catIdStr]);
      while (curr.parentId != null && idMap.has(String(curr.parentId))) {
        const pid = String(curr.parentId);
        if (visited.has(pid)) {
          inTree = true;
          break;
        }
        if (path.has(pid)) {
          break; // cycle detected
        }
        path.add(pid);
        curr = idMap.get(pid);
      }
      if (!inTree) {
        const current = idMap.get(catIdStr);
        roots.push(current);
        visited.add(catIdStr);
      }
    }
  });

  return roots;
}

/**
 * Fetches all active categories organized into a 1-level deep tree hierarchy.
 */
export async function fetchStoreCategoryTree() {
  const flatCategories = await fetchStoreCategoriesWithCount();
  return buildCategoryTree(flatCategories);
}
