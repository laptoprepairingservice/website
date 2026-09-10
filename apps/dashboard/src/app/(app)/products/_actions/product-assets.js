"use server";

import { getCurrentUser } from "@/lib/user";
import { createClient } from "@/lib/supabase/server";
import {
  deleteProductImageByPublicId,
  insertProductImage,
  setBannerImage,
  updateProductImageByPublicId,
} from "../_lib/product-repository";
import {
  deleteProductFiles,
  getProductAssetUrl,
  uploadProductFile,
} from "@/lib/supabase/storage";
import { isUuid } from "../_lib/uuid";

export async function uploadProductAssetAction(formData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin to upload assets." };
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return { error: "No file provided for upload." };
  }

  const productPublicId = formData.get("productPublicId");
  const isBanner = formData.get("isBanner") === "true";
  const altText = (formData.get("altText") || "").trim();
  const rawMediaType = formData.get("mediaType");
  const mediaType =
    rawMediaType === "video" || file.type?.startsWith("video/") ? "video" : "image";

  const supabase = await createClient();

  let productId = null;
  if (productPublicId) {
    const isNum =
      typeof productPublicId === "string" ? /^\d+$/.test(productPublicId) : typeof productPublicId === "number";

    let query = supabase.from("products").select("id");
    if (isUuid(productPublicId)) {
      query = query.eq("public_id", productPublicId);
    } else if (isNum) {
      query = query.eq("id", Number(productPublicId));
    } else {
      query = query.eq("slug", productPublicId);
    }

    const { data: product } = await query.single();
    productId = product?.id ?? null;
  }

  // Upload to Supabase Storage
  const { storagePath, publicUrl, error: uploadError } = await uploadProductFile(
    supabase,
    file,
    {
      productId: productId || "staging",
      fileName: file.name,
      isBanner,
      mediaType,
      contentType: file.type,
    }
  );

  if (uploadError || !storagePath) {
    return { error: uploadError?.message || "Failed to upload file to storage." };
  }

  // If a persisted product exists, save to database
  if (productId) {
    if (isBanner) {
      try {
        await supabase
          .from("product_images")
          .update({ is_banner: false })
          .eq("product_id", productId)
          .eq("is_banner", true);
      } catch {
        // Safe to ignore if column is missing
      }
    }

    const { count } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);

    const payload = {
      product_id: productId,
      storage_path: storagePath,
      alt_text: altText || null,
      is_banner: isBanner,
      media_type: mediaType,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      sort_order: count ?? 0,
    };

    const { data: asset, error: dbError } = await insertProductImage(supabase, payload);

    if (dbError || !asset) {
      await deleteProductFiles(supabase, storagePath);
      return { error: dbError?.message || "Failed to save asset record to database." };
    }

    return {
      asset: {
        ...asset,
        is_banner: isBanner,
        media_type: mediaType,
        url: publicUrl,
      },
    };
  }

  // Staged asset for new product
  return {
    asset: {
      storage_path: storagePath,
      url: publicUrl,
      alt_text: altText,
      is_banner: isBanner,
      media_type: mediaType,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      sort_order: 0,
    },
  };
}

export async function setProductBannerAction({ assetId, assetPublicId, productPublicId }) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin to modify asset roles." };
  }

  const assetIdentifier = assetId || assetPublicId;
  if (!assetIdentifier || !productPublicId) {
    return { error: "Missing asset or product identifier." };
  }

  const supabase = await createClient();

  const isNum =
    typeof productPublicId === "string" ? /^\d+$/.test(productPublicId) : typeof productPublicId === "number";

  let query = supabase.from("products").select("id");
  if (isUuid(productPublicId)) {
    query = query.eq("public_id", productPublicId);
  } else if (isNum) {
    query = query.eq("id", Number(productPublicId));
  } else {
    query = query.eq("slug", productPublicId);
  }

  const { data: product } = await query.single();
  if (!product) {
    return { error: "Product not found." };
  }

  const { data: asset, error } = await setBannerImage(supabase, product.id, assetIdentifier);
  if (error || !asset) {
    return { error: error?.message || "Failed to set banner image." };
  }

  return {
    asset: {
      ...asset,
      is_banner: true,
      url: getProductAssetUrl(asset.storage_path),
    },
  };
}

export async function updateProductAssetAction(values) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin to update assets." };
  }

  const { assetPublicId, altText, isBanner, sortOrder } = values;

  if (!assetPublicId) {
    return { error: "Asset identifier is required." };
  }

  const supabase = await createClient();

  const payload = {};
  if (altText !== undefined) payload.alt_text = altText ? altText.trim() : null;
  if (isBanner !== undefined) payload.is_banner = Boolean(isBanner);
  if (sortOrder !== undefined) payload.sort_order = Number(sortOrder);

  const { data: asset, error } = await updateProductImageByPublicId(
    supabase,
    assetPublicId,
    payload
  );

  if (error || !asset) {
    return { error: error?.message || "Could not update asset details." };
  }

  return {
    asset: {
      ...asset,
      url: getProductAssetUrl(asset.storage_path),
    },
  };
}

export async function deleteProductAssetAction({ assetPublicId, storagePath }) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin to delete assets." };
  }

  const supabase = await createClient();

  if (assetPublicId) {
    const { data: deleted, error } = await deleteProductImageByPublicId(
      supabase,
      assetPublicId
    );

    if (error) {
      return { error: error.message || "Failed to delete asset from database." };
    }

    if (deleted?.storage_path) {
      await deleteProductFiles(supabase, deleted.storage_path);
    }
  } else if (storagePath) {
    await deleteProductFiles(supabase, storagePath);
  }

  return { success: true };
}

// Backward compatibility alias
export const setAssetRoleAction = async ({ assetPublicId, productPublicId, role }) => {
  if (role === "banner") {
    return setProductBannerAction({ assetPublicId, productPublicId });
  }
  return { success: true };
};
