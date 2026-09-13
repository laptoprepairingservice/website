import { getProductAssetUrl } from "@/lib/store/storage/product-assets";

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
    images: allImages.length > 0 ? allImages : imageUrl ? [imageUrl] : [],
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
