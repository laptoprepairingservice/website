"use server";

import { getCurrentUser } from "@/lib/user";
import { createClient } from "@/lib/supabase/server";
import {
  toProductInsertPayload,
  toVariantInsertPayload,
} from "../_lib/product-mapper";
import { productFormSchema } from "../_lib/product-schema";
import {
  deleteProductById,
  formatSupabaseError,
  insertDefaultVariant,
  insertProduct,
} from "../_lib/product-repository";

export async function createProductAction(values) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin to create products." };
  }

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Please check the form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const productPayload = toProductInsertPayload(parsed.data);

  const { data: product, error: productError } = await insertProduct(supabase, productPayload);

  if (productError || !product) {
    return {
      error: formatSupabaseError(productError, "Could not create the product."),
    };
  }

  const variantPayload = toVariantInsertPayload(product.id, parsed.data);
  const { error: variantError } = await insertDefaultVariant(supabase, variantPayload);

  if (variantError) {
    await deleteProductById(supabase, product.id);
    return {
      error: formatSupabaseError(variantError, "Product was created but the default variant failed."),
    };
  }

  return { productId: product.id };
}
