"use server";

import { getCurrentUser } from "@/lib/user";
import { createClient } from "@/lib/supabase/server";
import {
  deleteProductById,
  formatSupabaseError,
} from "../_lib/product-repository";
import { deleteProductFiles } from "@/lib/supabase/storage";

export async function deleteProductAction(productId) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin to delete products." };
  }

  const id = Number(productId);
  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Invalid product identifier." };
  }

  const supabase = await createClient();

  // 1. Fetch images to clean up Supabase storage files
  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", id);

  if (images && images.length > 0) {
    const storagePaths = images
      .map((img) => img.storage_path)
      .filter((p) => p && !p.startsWith("http"));
    if (storagePaths.length > 0) {
      await deleteProductFiles(supabase, storagePaths);
    }
  }

  // 2. Delete product record (variants and image records cascade-delete in DB)
  const { error } = await deleteProductById(supabase, id);

  if (error) {
    return { error: formatSupabaseError(error, "Could not delete the product.") };
  }

  return { success: true };
}
