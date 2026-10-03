import { getPublicSupabaseClient } from "@/lib/store/client";
import { getProductAssetUrl } from "@/lib/store/storage/product-assets";
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
 * Fetches all active categories along with the available brands that have at least one active product.
 * Returns categories each containing a `brands` array with brand details and product count.
 */
export async function fetchStoreNavCategoriesWithBrands() {
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
        .select(`
          id,
          name,
          slug,
          category_id,
          brand_id,
          brands:brand_id (
            id,
            public_id,
            name,
            slug,
            logo_path,
            is_active
          )
        `)
        .eq("status", "active")
        .not("brand_id", "is", null)
        .not("category_id", "is", null),
    ]);

    if (categoriesRes.error) {
      console.error("fetchStoreNavCategoriesWithBrands categories error:", categoriesRes.error);
      return [];
    }

    // Map active products to (category_id -> brands with count)
    const categoryBrandMap = new Map();
    const categoryProductCounts = new Map();

    (productsRes.data || []).forEach((p) => {
      const catId = p.category_id;
      const brand = p.brands;
      if (!catId || !brand || brand.is_active === false) return;

      categoryProductCounts.set(catId, (categoryProductCounts.get(catId) || 0) + 1);

      if (!categoryBrandMap.has(catId)) {
        categoryBrandMap.set(catId, new Map());
      }
      const bMap = categoryBrandMap.get(catId);
      if (!bMap.has(brand.id)) {
        bMap.set(brand.id, {
          id: brand.id,
          publicId: brand.public_id,
          name: brand.name,
          slug: brand.slug,
          logo: getProductAssetUrl(brand.logo_path),
          productCount: 1,
        });
      } else {
        bMap.get(brand.id).productCount += 1;
      }
    });

    const mappedCategories = (categoriesRes.data || []).map((cat) => {
      const totalCount = categoryProductCounts.get(cat.id) || 0;
      const mapped = mapSupabaseCategory(cat, totalCount);
      const bMap = categoryBrandMap.get(cat.id);
      const brands = bMap
        ? Array.from(bMap.values()).sort(
            (a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name)
          )
        : [];

      return {
        ...mapped,
        brands,
      };
    });

    return mappedCategories;
  } catch (err) {
    console.error("fetchStoreNavCategoriesWithBrands error:", err);
    return [];
  }
}

/**
 * Fetches all active categories organized into navigation categories with their available brands.
 */
export async function fetchStoreCategoryTree() {
  return fetchStoreNavCategoriesWithBrands();
}
