import { getPublicSupabaseClient } from "@/lib/store/client";
import { getProductAssetUrl } from "@/lib/store/storage/product-assets";
import { mapSupabaseProduct } from "./mapper";
import {
  PRODUCT_CATEGORY_SELECT,
  PRODUCT_DETAIL_SELECT,
  PRODUCT_LIVE_SEARCH_SELECT,
} from "./select";

/**
 * Fetches active products with optional filters and sorting from Supabase
 */
export async function fetchStoreProducts({
  category = null,
  brand = null,
  search = null,
  minPrice = null,
  maxPrice = null,
  inStock = null,
  rating = null,
  sort = null,
  limit = 100,
} = {}) {
  try {
    const supabase = getPublicSupabaseClient();
    let query = supabase
      .from("products")
      .select(PRODUCT_DETAIL_SELECT)
      .eq("status", "active");

    if (search && search.trim()) {
      const clean = search.trim();
      query = query.or(
        `name.ilike.%${clean}%,short_description.ilike.%${clean}%,description.ilike.%${clean}%`
      );
    }

    query = query.order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching store products:", error);
      return [];
    }

    let products = (data || []).map(mapSupabaseProduct).filter(Boolean);

    // Multi-category filtering
    if (category) {
      const categoryList = Array.isArray(category)
        ? category
        : String(category).split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

      if (categoryList.length > 0) {
        products = products.filter(
          (p) => p.category && categoryList.includes(p.category.toLowerCase())
        );
      }
    }

    // Multi-brand filtering
    if (brand) {
      const brandList = Array.isArray(brand)
        ? brand
        : String(brand).split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

      if (brandList.length > 0) {
        products = products.filter((p) => {
          const bSlug = (p.brandSlug || "").toLowerCase();
          const bName = (p.brand || "").toLowerCase();
          return brandList.some((b) => b === bSlug || b === bName);
        });
      }
    }

    // Price range filtering
    if (minPrice != null && !isNaN(Number(minPrice))) {
      const min = Number(minPrice);
      products = products.filter((p) => (p.price ?? 0) >= min);
    }
    if (maxPrice != null && !isNaN(Number(maxPrice))) {
      const max = Number(maxPrice);
      products = products.filter((p) => (p.price ?? 0) <= max);
    }

    // In-stock availability filtering
    if (inStock === true || inStock === "true" || inStock === "1") {
      products = products.filter((p) => p.inStock);
    }

    // Rating filtering
    if (rating != null && !isNaN(Number(rating))) {
      const minRating = Number(rating);
      products = products.filter((p) => (p.rating ?? 5) >= minRating);
    }

    // Sorting
    if (sort === "price-asc") {
      products.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sort === "price-desc") {
      products.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sort === "bestseller") {
      products.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else if (sort === "rating") {
      products.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return products;
  } catch (err) {
    console.error("Failed to fetch store products:", err);
    return [];
  }
}

/**
 * Fast live search query for combobox autocomplete.
 * Searches products and categories in parallel.
 */
export async function searchStoreLive({ query = "", limit = 6 } = {}) {
  const clean = (query || "").trim();
  if (!clean) {
    return { products: [], categories: [], totalCount: 0 };
  }

  try {
    const supabase = getPublicSupabaseClient();

    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select(PRODUCT_LIVE_SEARCH_SELECT, { count: "exact" })
        .eq("status", "active")
        .or(`name.ilike.%${clean}%,short_description.ilike.%${clean}%`)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("categories")
        .select("id, public_id, name, slug, image_path, is_active")
        .eq("is_active", true)
        .ilike("name", `%${clean}%`)
        .limit(4),
    ]);

    const products = (productsRes.data || []).map(mapSupabaseProduct).filter(Boolean);
    const categories = (categoriesRes.data || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: getProductAssetUrl(c.image_path),
    }));

    return {
      products,
      categories,
      totalCount: productsRes.count ?? products.length,
    };
  } catch (err) {
    console.error("Live search failed:", err);
    return { products: [], categories: [], totalCount: 0 };
  }
}

/**
 * Fetches recommended/related products for the search page
 * (bestsellers/featured items, excluding specified product IDs)
 */
export async function fetchRelatedSearchProducts({ limit = 4, excludeIds = [] } = {}) {
  try {
    const supabase = getPublicSupabaseClient();
    let query = supabase
      .from("products")
      .select(PRODUCT_DETAIL_SELECT)
      .eq("status", "active");

    const safeIds = Array.isArray(excludeIds) ? excludeIds.filter(Boolean) : [];
    if (safeIds.length > 0) {
      query = query.not("id", "in", `(${safeIds.join(",")})`);
    }

    query = query
      .order("is_bestseller", { ascending: false })
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching related search products:", error);
      return [];
    }

    return (data || []).map(mapSupabaseProduct).filter(Boolean);
  } catch (err) {
    console.error("Failed to fetch related search products:", err);
    return [];
  }
}

/**
 * Fetches a single product by slug from Supabase
 */
export async function fetchProductBySlug(slug) {
  if (!slug) return null;
  try {
    const supabase = getPublicSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_DETAIL_SELECT)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Error fetching product by slug:", error);
      return null;
    }

    return mapSupabaseProduct(data);
  } catch (err) {
    console.error("Failed to fetch product by slug:", err);
    return null;
  }
}

/**
 * Fetches related products from Supabase
 */
export async function fetchRelatedProducts(product, limit = 4) {
  if (!product) return [];
  try {
    const supabase = getPublicSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_DETAIL_SELECT)
      .eq("status", "active")
      .neq("id", product.id)
      .limit(limit);

    if (error) return [];
    return (data || []).map(mapSupabaseProduct).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Fetches up to limit active products for a specific category
 */
export async function fetchCategoryProducts(categorySlug, limit = 20) {
  if (!categorySlug) return [];
  try {
    const supabase = getPublicSupabaseClient();

    const { data: catData } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("slug", categorySlug)
      .maybeSingle();

    let query = supabase
      .from("products")
      .select(PRODUCT_CATEGORY_SELECT)
      .eq("status", "active");

    if (catData?.id) {
      query = query.eq("category_id", catData.id);
    }

    query = query.order("created_at", { ascending: false }).limit(limit);

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching category products:", error);
      return [];
    }

    let products = (data || []).map(mapSupabaseProduct).filter(Boolean);
    if (!catData?.id) {
      products = products.filter((p) => p.category === categorySlug);
    }

    return products;
  } catch (err) {
    console.error("Failed to fetch category products:", err);
    return [];
  }
}

/**
 * Fetches all product slugs from Supabase
 */
export async function fetchAllProductSlugs() {
  try {
    const supabase = getPublicSupabaseClient();
    const { data } = await supabase
      .from("products")
      .select("slug, updated_at, categories(slug)")
      .eq("status", "active");
    return data || [];
  } catch {
    return [];
  }
}
