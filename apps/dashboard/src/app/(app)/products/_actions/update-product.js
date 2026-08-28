"use server";

import { getCurrentUser } from "@/lib/user";
import { createClient } from "@/lib/supabase/server";
import { toProductUpdatePayload, toVariantUpdatePayload } from "../_lib/product-mapper";
import { updateProductFormSchema } from "../_lib/product-schema";
import {
  fetchProductWithDefaultVariant,
  formatSupabaseError,
  updateProductById,
  updateVariantById,
} from "../_lib/product-repository";

export async function updateProductAction(values) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin to update products." };
  }

  const parsed = updateProductFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Please check the form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { id, default_variant: defaultVariant } = parsed.data;

  const existing = await fetchProductWithDefaultVariant(supabase, id);
  if (existing.error || !existing.product) {
    return { error: "Product not found." };
  }

  if (!existing.defaultVariant || existing.defaultVariant.id !== defaultVariant.id) {
    return { error: "Default variant not found for this product." };
  }

  const productPayload = toProductUpdatePayload(parsed.data);
  const { error: productError } = await updateProductById(supabase, id, productPayload);

  if (productError) {
    return {
      error: formatSupabaseError(productError, "Could not update the product."),
    };
  }

  const variantPayload = toVariantUpdatePayload(parsed.data);
  const { error: variantError } = await updateVariantById(
    supabase,
    defaultVariant.id,
    variantPayload
  );

  if (variantError) {
    return {
      error: formatSupabaseError(variantError, "Product saved but the variant update failed."),
    };
  }

  return { productId: id };
}

export async function getProductForEditAction(productId) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin to view products." };
  }

  const supabase = await createClient();
  const result = await fetchProductWithDefaultVariant(supabase, productId);

  if (result.error || !result.product) {
    return { error: "Product not found." };
  }

  return {
    product: result.product,
    defaultVariant: result.defaultVariant,
  };
}
