import { mapSupabaseBrand } from "@/lib/store/brands/mapper";
import { mapSupabaseCategory } from "@/lib/store/categories/mapper";
import { getPublicSupabaseClient } from "@/lib/store/client";
import { mapSupabaseProduct } from "@/lib/store/products/mapper";
import { PRODUCT_DETAIL_SELECT } from "@/lib/store/products/select";

/**
 * Fetches all necessary aggregated data for the homepage from Supabase:
 * - Active categories (with product counts)
 * - Active brands
 * - Active products (with variants, images, category, brand)
 * - Featured product
 */
export async function fetchStoreHomeData() {
  try {
    const supabase = getPublicSupabaseClient();

    const [categoriesRes, brandsRes, productsRes] = await Promise.all([
      supabase
        .from("categories")
        .select("id, public_id, parent_id, name, slug, description, image_path, is_active, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("brands")
        .select("id, public_id, name, slug, logo_path, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true }),
      supabase
        .from("products")
        .select(PRODUCT_DETAIL_SELECT)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
    ]);

    const rawProducts = productsRes.data || [];
    const products = rawProducts.map(mapSupabaseProduct).filter(Boolean);

    // Compute category counts from live products
    const productCountByCatSlug = {};
    products.forEach((p) => {
      if (p.category) {
        productCountByCatSlug[p.category] = (productCountByCatSlug[p.category] || 0) + 1;
      }
    });

    const categories = (categoriesRes.data || [])
      .map((cat) => mapSupabaseCategory(cat, productCountByCatSlug[cat.slug] || 0))
      .filter(Boolean);

    const brands = (brandsRes.data || []).map(mapSupabaseBrand).filter(Boolean);

    const featuredProduct = products.find((p) => p.isBestSeller) || products[0] || null;

    return {
      categories,
      brands,
      products,
      featuredProduct,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch store home data:", error);
    return {
      categories: [],
      brands: [],
      products: [],
      featuredProduct: null,
      error: error.message,
    };
  }
}
