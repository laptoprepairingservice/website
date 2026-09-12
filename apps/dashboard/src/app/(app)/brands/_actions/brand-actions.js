"use server";

import { formatSupabaseError } from "@/lib/supabase/format-error";
import { getCurrentUser } from "@/lib/user";
import { createClient } from "@/lib/supabase/server";
import { brandFormSchema, updateBrandFormSchema } from "../_lib/brand-schema";
import {
  deleteProductFiles,
  uploadProductFile,
} from "@/lib/supabase/storage";

function emptyToNull(value) {
  if (value === "" || value === undefined) {
    return null;
  }
  return value;
}

function toBrandPayload(values) {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    logo_path: emptyToNull(values.logo_path?.trim()),
    website_url: emptyToNull(values.website_url?.trim()),
    description: emptyToNull(values.description?.trim()),
    sort_order: values.sort_order ?? 0,
    is_active: values.is_active,
  };
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin." };
  }
  return { user };
}

export async function uploadBrandLogoAction(formData) {
  const auth = await requireAdmin();
  if (auth.error) {
    return { error: auth.error };
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return { error: "No image file provided for upload." };
  }

  const supabase = await createClient();

  const { storagePath, publicUrl, error: uploadError } = await uploadProductFile(
    supabase,
    file,
    {
      productId: "brands",
      fileName: file.name || "brand-logo",
      mediaType: "image",
    }
  );

  if (uploadError) {
    return { error: formatSupabaseError(uploadError, "Failed to upload brand logo.") };
  }

  return { storagePath, publicUrl };
}

export async function deleteBrandLogoAction(storagePath) {
  const auth = await requireAdmin();
  if (auth.error) {
    return { error: auth.error };
  }

  if (!storagePath) {
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await deleteProductFiles(supabase, storagePath);
  if (error) {
    return { error: formatSupabaseError(error, "Failed to delete brand logo from storage.") };
  }

  return { success: true };
}

export async function createBrandAction(values) {
  const auth = await requireAdmin();
  if (auth.error) {
    return { error: auth.error };
  }

  const parsed = brandFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the form and try again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .insert(toBrandPayload(parsed.data))
    .select("id")
    .single();

  if (error) {
    return { error: formatSupabaseError(error, "Could not create the brand.") };
  }

  return { id: data.id };
}

export async function updateBrandAction(values) {
  const auth = await requireAdmin();
  if (auth.error) {
    return { error: auth.error };
  }

  const parsed = updateBrandFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the form and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .update(toBrandPayload(parsed.data))
    .eq("id", parsed.data.id);

  if (error) {
    return { error: formatSupabaseError(error, "Could not update the brand.") };
  }

  return { id: parsed.data.id };
}

export async function deleteBrandAction(id) {
  const auth = await requireAdmin();
  if (auth.error) {
    return { error: auth.error };
  }

  const brandId = Number(id);
  if (!Number.isInteger(brandId) || brandId <= 0) {
    return { error: "Invalid brand." };
  }

  const supabase = await createClient();

  // Retrieve existing brand to clean up logo if stored
  const { data: existing } = await supabase
    .from("brands")
    .select("logo_path")
    .eq("id", brandId)
    .single();

  const { error } = await supabase.from("brands").delete().eq("id", brandId);

  if (error) {
    return { error: formatSupabaseError(error, "Could not delete the brand.") };
  }

  if (existing?.logo_path && !existing.logo_path.startsWith("http")) {
    await deleteProductFiles(supabase, existing.logo_path);
  }

  return { success: true };
}
