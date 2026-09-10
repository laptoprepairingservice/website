import { getSupabaseUrl } from "./env";

export const PRODUCT_STORAGE_BUCKET = "products";

/**
 * Returns the full public URL for an asset stored in the products bucket.
 * If the path is already a full URL or blob URL, it is returned directly.
 *
 * @param {string} storagePath
 * @returns {string}
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
    return storagePath;
  }
}

/**
 * Sanitize file name for URL/storage safety
 * @param {string} name
 * @returns {string}
 */
export function sanitizeFileName(name = "file") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Build a structured storage path for product assets
 *
 * @param {Object} options
 * @param {string|number} [options.productId]
 * @param {string} [options.fileName]
 * @param {boolean} [options.isBanner]
 * @param {"image"|"video"} [options.mediaType]
 * @returns {string}
 */
export function buildProductAssetStoragePath({
  productId = "draft",
  fileName = "asset",
  isBanner = false,
  mediaType = "image",
}) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).slice(2, 7);
  const cleanName = sanitizeFileName(fileName);
  const prefix = isBanner ? "banner" : mediaType === "video" ? "video" : "image";

  return `${productId}/${prefix}_${timestamp}_${randomStr}_${cleanName}`;
}

/**
 * Upload a file to the products Supabase storage bucket
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {File|Blob|Buffer} file
 * @param {Object} options
 * @param {string|number} [options.productId]
 * @param {string} [options.fileName]
 * @param {boolean} [options.isBanner]
 * @param {"image"|"video"} [options.mediaType]
 * @param {string} [options.contentType]
 * @returns {Promise<{ storagePath: string, publicUrl: string, error: any }>}
 */
export async function uploadProductFile(supabase, file, options = {}) {
  const fileName = options.fileName || (file instanceof File ? file.name : "asset");
  const isBanner = Boolean(options.isBanner);
  const mediaType = options.mediaType || (file?.type?.startsWith("video/") ? "video" : "image");
  const contentType = options.contentType || (file instanceof File ? file.type : undefined);

  const storagePath = buildProductAssetStoragePath({
    productId: options.productId || "shared",
    fileName,
    isBanner,
    mediaType,
  });

  const { data, error } = await supabase.storage
    .from(PRODUCT_STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType,
    });

  if (error) {
    return { storagePath: null, publicUrl: null, error };
  }

  const publicUrl = getProductAssetUrl(data.path);

  return { storagePath: data.path, publicUrl, error: null };
}

/**
 * Delete one or more files from the products storage bucket
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string|string[]} storagePaths
 * @returns {Promise<{ error: any }>}
 */
export async function deleteProductFiles(supabase, storagePaths) {
  const paths = (Array.isArray(storagePaths) ? storagePaths : [storagePaths])
    .filter(Boolean)
    .map((p) => p.replace(/^products\//, ""));

  if (paths.length === 0) {
    return { error: null };
  }

  const { error } = await supabase.storage.from(PRODUCT_STORAGE_BUCKET).remove(paths);

  return { error };
}
