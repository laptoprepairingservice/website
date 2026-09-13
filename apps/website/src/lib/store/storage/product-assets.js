import { getSupabaseUrl } from "@/lib/supabase/env";

export const PRODUCT_STORAGE_BUCKET = "products";

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
