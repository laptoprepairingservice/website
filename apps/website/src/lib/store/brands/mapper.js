import { getProductAssetUrl } from "@/lib/store/storage/product-assets";

/**
 * Normalizes a Supabase brand record
 */
export function mapSupabaseBrand(brand) {
  if (!brand) return null;
  return {
    id: brand.id,
    publicId: brand.public_id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description || "",
    metaTitle: brand.meta_title || "",
    metaDescription: brand.meta_description || "",
    logo: getProductAssetUrl(brand.logo_path),
  };
}
