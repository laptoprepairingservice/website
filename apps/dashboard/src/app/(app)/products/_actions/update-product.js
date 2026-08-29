"use server";

import { getCurrentUser } from "@/lib/user";
import { createClient } from "@/lib/supabase/server";
import { toProductUpdatePayload, toVariantUpdatePayload } from "../_lib/product-mapper";
import { updateProductFormSchema } from "../_lib/product-schema";
import {
  fetchProductWithDefaultVariant,
  formatSupabaseError,
  updateProductByPublicId,
  updateVariantByPublicId,
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
  const { public_id: productPublicId, default_variant: defaultVariant } = parsed.data;

  const existing = await fetchProductWithDefaultVariant(supabase, productPublicId);
  if (existing.error || !existing.product) {
    return { error: "Product not found." };
  }

  if (!existing.defaultVariant || existing.defaultVariant.public_id !== defaultVariant.public_id) {
    return { error: "Default variant not found for this product." };
  }

  const productPayload = toProductUpdatePayload(parsed.data);
  const { error: productError } = await updateProductByPublicId(
    supabase,
    productPublicId,
    productPayload
  );

  if (productError) {
    return {
      error: formatSupabaseError(productError, "Could not update the product."),
    };
  }

  const variantPayload = toVariantUpdatePayload(parsed.data);
  const { error: variantError } = await updateVariantByPublicId(
    supabase,
    defaultVariant.public_id,
    variantPayload
  );

  if (variantError) {
    return {
      error: formatSupabaseError(variantError, "Product saved but the variant update failed."),
    };
  }

  return { productPublicId };
}

export async function getProductForEditAction(productPublicId) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin to view products." };
  }

  const supabase = await createClient();
  const result = await fetchProductWithDefaultVariant(supabase, productPublicId);

  if (result.error || !result.product) {
    return { error: "Product not found." };
  }

  return {
    product: result.product,
    defaultVariant: result.defaultVariant,
  };
}
