import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

export const PRODUCT_STORAGE_BUCKET = "products";

let publicSupabase = null;

export function getPublicSupabaseClient() {
  if (!publicSupabase) {
    publicSupabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return publicSupabase;
}

/**
 * Resolve Supabase storage path to public URL.
 * Returns empty string if no valid path exists (NO dummy/mock URLs).
 */
export function getProductAssetUrl(storagePath) {
  if (!storagePath) {
    return "";
  }

  if (
    storagePath.startsWith("http://") ||
    storagePath.startsWith("https://") ||
    storagePath.startsWith("blob:") ||
    storagePath.startsWith("data:")
  ) {
    return storagePath;
  }

  try {
    const supabaseUrl = getSupabaseUrl().replace(/\/$/, "");
    const cleanPath = storagePath.replace(/^\/+/, "").replace(/^products\/+/, "");
    return `${supabaseUrl}/storage/v1/object/public/${PRODUCT_STORAGE_BUCKET}/${cleanPath}`;
  } catch {
    return "";
  }
}

/**
 * Normalizes a Supabase product database record into the shape expected by ProductCard & ProductDetail
 */
export function mapSupabaseProduct(product) {
  if (!product) return null;

  // 1. Determine default variant or first variant
  const variants = Array.isArray(product.product_variants) ? product.product_variants : [];
  const defaultVariant = variants.find((v) => v.is_default) || variants[0] || null;

  const price = defaultVariant?.price != null ? Number(defaultVariant.price) : 0;
  const originalPrice =
    defaultVariant?.compare_at_price != null ? Number(defaultVariant.compare_at_price) : null;

  // 2. Select primary image (prioritizing banner image if present)
  const images = Array.isArray(product.product_images) ? product.product_images : [];
  const sortedImages = [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const bannerImg = sortedImages.find((img) => img.is_banner);
  const primaryImg = bannerImg || sortedImages[0];
  const imageUrl = primaryImg?.storage_path ? getProductAssetUrl(primaryImg.storage_path) : "";
  const allImages = sortedImages
    .map((img) => getProductAssetUrl(img.storage_path))
    .filter(Boolean);

  // 3. Category & Brand names
  const categorySlug = product.categories?.slug || "";
  const categoryName = product.categories?.name || "Components";
  const brandName = product.brands?.name || "Hardware";
  const brandSlug = product.brands?.slug || "";

  return {
    id: product.id,
    publicId: product.public_id,
    variantId: defaultVariant?.id || null,
    defaultVariantId: defaultVariant?.id || null,
    name: product.name,
    slug: product.slug,
    brand: brandName,
    brandSlug,
    category: categorySlug,
    categoryName,
    sku: defaultVariant?.sku || product.sku || "",
    image: imageUrl,
    images: allImages.length > 0 ? allImages : (imageUrl ? [imageUrl] : []),
    bannerImage: bannerImg?.storage_path ? getProductAssetUrl(bannerImg.storage_path) : null,
    price,
    originalPrice,
    rating: 5,
    reviewCount: 0,
    inStock: defaultVariant?.is_active ?? true,
    stockCount: 10,
    isNew: product.created_at
      ? Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000
      : false,
    isBestSeller: Boolean(product.is_bestseller),
    isFeatured: Boolean(product.is_featured),
    shortDescription: product.short_description || "",
    description: product.description || "",
    specifications: product.specifications || "",
    compatibility: product.compatibility || "",
    compatibilityList: product.compatibility
      ? product.compatibility
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    specs: defaultVariant?.options || {},
    variants,
  };
}

/**
 * Fetches all necessary data for the homepage from Supabase:
 * - Active categories (with product counts)
 * - Active brands
 * - Active products (with variants, images, category, brand)
 */
export async function fetchStoreHomeData() {
  try {
    const supabase = getPublicSupabaseClient();

    const [categoriesRes, brandsRes, productsRes] = await Promise.all([
      supabase
        .from("categories")
        .select("id, public_id, name, slug, image_path, is_active, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("brands")
        .select("id, public_id, name, slug, logo_path, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true }),
      supabase
        .from("products")
        .select(`
          id,
          public_id,
          name,
          slug,
          short_description,
          description,
          specifications,
          compatibility,
          is_featured,
          is_bestseller,
          created_at,
          status,
          categories (id, name, slug),
          brands (id, name, slug),
          product_variants (
            id,
            public_id,
            sku,
            price,
            compare_at_price,
            variant_name,
            is_default,
            is_active,
            options
          ),
          product_images (
            id,
            storage_path,
            sort_order,
            is_banner
          )
        `)
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

    const categories = (categoriesRes.data || []).map((cat) => ({
      id: cat.slug,
      name: cat.name,
      slug: cat.slug,
      image: getProductAssetUrl(cat.image_path),
      count: productCountByCatSlug[cat.slug] || 0,
    }));

    const brands = (brandsRes.data || []).map((b) => ({
      id: b.slug,
      name: b.name,
      slug: b.slug,
      logo: getProductAssetUrl(b.logo_path),
    }));

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

/**
 * Fetches active products with optional filters from Supabase
 */
export async function fetchStoreProducts({ category = null, brand = null, search = null, limit = 50 } = {}) {
  try {
    const supabase = getPublicSupabaseClient();
    let query = supabase
      .from("products")
      .select(`
        id,
        public_id,
        name,
        slug,
        short_description,
        description,
        specifications,
        compatibility,
        is_featured,
        is_bestseller,
        created_at,
        status,
        categories (id, name, slug),
        brands (id, name, slug),
        product_variants (
          id,
          public_id,
          sku,
          price,
          compare_at_price,
          variant_name,
          is_default,
          is_active,
          options
        ),
        product_images (
          id,
          storage_path,
          sort_order,
          is_banner
        )
      `)
      .eq("status", "active");

    if (search) {
      query = query.ilike("name", `%${search}%`);
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

    if (category) {
      products = products.filter((p) => p.category === category);
    }

    if (brand) {
      products = products.filter(
        (p) => p.brandSlug === brand || p.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    return products;
  } catch (err) {
    console.error("Failed to fetch store products:", err);
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
      .select(`
        id,
        public_id,
        name,
        slug,
        short_description,
        description,
        specifications,
        compatibility,
        is_featured,
        is_bestseller,
        created_at,
        status,
        categories (id, name, slug),
        brands (id, name, slug),
        product_variants (
          id,
          public_id,
          sku,
          price,
          compare_at_price,
          variant_name,
          is_default,
          is_active,
          options
        ),
        product_images (
          id,
          storage_path,
          sort_order,
          is_banner
        )
      `)
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
      .select(`
        id,
        public_id,
        name,
        slug,
        short_description,
        description,
        specifications,
        compatibility,
        is_featured,
        is_bestseller,
        created_at,
        status,
        categories (id, name, slug),
        brands (id, name, slug),
        product_variants (
          id,
          public_id,
          sku,
          price,
          compare_at_price,
          variant_name,
          is_default,
          is_active,
          options
        ),
        product_images (
          id,
          storage_path,
          sort_order,
          is_banner
        )
      `)
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
 * Fetches all categories from Supabase
 */
export async function fetchStoreCategories() {
  try {
    const supabase = getPublicSupabaseClient();
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, public_id, name, slug, image_path, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) return [];

    return (categories || []).map((cat) => ({
      id: cat.slug,
      name: cat.name,
      slug: cat.slug,
      image: getProductAssetUrl(cat.image_path),
    }));
  } catch {
    return [];
  }
}

/**
 * Fetches all brands from Supabase
 */
export async function fetchStoreBrands() {
  try {
    const supabase = getPublicSupabaseClient();
    const { data: brands, error } = await supabase
      .from("brands")
      .select("id, public_id, name, slug, logo_path, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) return [];

    return (brands || []).map((b) => ({
      id: b.slug,
      name: b.name,
      slug: b.slug,
      logo: getProductAssetUrl(b.logo_path),
    }));
  } catch {
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
      .select("slug, updated_at")
      .eq("status", "active");
    return data || [];
  } catch {
    return [];
  }
}
