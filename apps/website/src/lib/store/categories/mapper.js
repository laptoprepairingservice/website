import { getProductAssetUrl } from "@/lib/store/storage/product-assets";

/**
 * Normalizes a Supabase category record
 */
export function mapSupabaseCategory(category, count = 0) {
  if (!category) return null;
  return {
    id: category.id || category.slug,
    publicId: category.public_id,
    parentId: category.parent_id ?? null,
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    image: getProductAssetUrl(category.image_path),
    count: count ?? 0,
  };
}
