import { getProductAssetUrl } from "@/lib/store/storage/product-assets";

/**
 * Normalizes a Supabase brand record
 */
export function mapSupabaseBrand(brand) {
  if (!brand) return null;
  return {
    id: brand.slug,
    publicId: brand.public_id,
    name: brand.name,
    slug: brand.slug,
    logo: getProductAssetUrl(brand.logo_path),
  };
}
