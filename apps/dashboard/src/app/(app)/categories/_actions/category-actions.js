"use server";

import { formatSupabaseError } from "@/lib/supabase/format-error";
import { getCurrentUser } from "@/lib/user";
import { createClient } from "@/lib/supabase/server";
import {
  categoryFormSchema,
  updateCategoryFormSchema,
} from "../_lib/category-schema";

function emptyToNull(value) {
  if (value === "" || value === undefined) {
    return null;
  }
  return value;
}

function toCategoryPayload(values) {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    parent_id: values.parent_id ?? null,
    description: emptyToNull(values.description?.trim()),
    image_path: emptyToNull(values.image_path?.trim()),
    sort_order: values.sort_order ?? 0,
    is_active: values.is_active,
    meta_title: emptyToNull(values.meta_title?.trim()),
    meta_description: emptyToNull(values.meta_description?.trim()),
  };
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin." };
  }
  return { user };
}

export async function getCategoryParentOptionsAction(excludeId) {
  const auth = await requireAdmin();
  if (auth.error) {
    return { error: auth.error, categories: [] };
  }

  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("id, name, parent_id")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: formatSupabaseError(error, "Could not load categories."), categories: [] };
  }

  return { categories: data ?? [] };
}

export async function createCategoryAction(values) {
  const auth = await requireAdmin();
  if (auth.error) {
    return { error: auth.error };
  }

  const parsed = categoryFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the form and try again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert(toCategoryPayload(parsed.data))
    .select("id")
    .single();

  if (error) {
    return { error: formatSupabaseError(error, "Could not create the category.") };
  }

  return { id: data.id };
}

export async function updateCategoryAction(values) {
  const auth = await requireAdmin();
  if (auth.error) {
    return { error: auth.error };
  }

  const parsed = updateCategoryFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the form and try again." };
  }

  if (parsed.data.parent_id === parsed.data.id) {
    return { error: "A category cannot be its own parent." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update(toCategoryPayload(parsed.data))
    .eq("id", parsed.data.id);

  if (error) {
    return { error: formatSupabaseError(error, "Could not update the category.") };
  }

  return { id: parsed.data.id };
}

export async function deleteCategoryAction(id) {
  const auth = await requireAdmin();
  if (auth.error) {
    return { error: auth.error };
  }

  const categoryId = Number(id);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { error: "Invalid category." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);

  if (error) {
    return { error: formatSupabaseError(error, "Could not delete the category.") };
  }

  return { success: true };
}
