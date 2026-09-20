"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const addressSchema = z.object({
  label: z.string().trim().optional(),
  full_name: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().min(8, "Enter a valid phone number"),
  address_line1: z.string().trim().min(5, "Address is required"),
  address_line2: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  postal_code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  country: z.string().trim().default("India"),
  is_default: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthenticatedUserId(supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return user.id;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Add a new address for the current user.
 */
export async function addAddressAction(formData) {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const raw = {
      label: formData.get("label") || undefined,
      full_name: formData.get("full_name"),
      phone: formData.get("phone"),
      address_line1: formData.get("address_line1"),
      address_line2: formData.get("address_line2") || undefined,
      landmark: formData.get("landmark") || undefined,
      city: formData.get("city"),
      state: formData.get("state"),
      postal_code: formData.get("postal_code"),
      country: formData.get("country") || "India",
      is_default: formData.get("is_default"),
    };

    const parsed = addressSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid address data." };
    }

    const data = parsed.data;

    // If this is set as default, clear existing defaults first
    if (data.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const { error } = await supabase.from("addresses").insert({
      user_id: userId,
      label: data.label || null,
      full_name: data.full_name,
      phone: data.phone,
      address_line1: data.address_line1,
      address_line2: data.address_line2 || null,
      landmark: data.landmark || null,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
      is_default: data.is_default,
    });

    if (error) return { error: error.message };

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true };
  } catch (err) {
    return { error: err.message || "Failed to add address." };
  }
}

/**
 * Update an existing address by public_id.
 */
export async function updateAddressAction(formData) {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const publicId = formData.get("public_id");
    if (!publicId) return { error: "Address ID is required." };

    const raw = {
      label: formData.get("label") || undefined,
      full_name: formData.get("full_name"),
      phone: formData.get("phone"),
      address_line1: formData.get("address_line1"),
      address_line2: formData.get("address_line2") || undefined,
      landmark: formData.get("landmark") || undefined,
      city: formData.get("city"),
      state: formData.get("state"),
      postal_code: formData.get("postal_code"),
      country: formData.get("country") || "India",
      is_default: formData.get("is_default"),
    };

    const parsed = addressSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid address data." };
    }

    const data = parsed.data;

    if (data.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const { error } = await supabase
      .from("addresses")
      .update({
        label: data.label || null,
        full_name: data.full_name,
        phone: data.phone,
        address_line1: data.address_line1,
        address_line2: data.address_line2 || null,
        landmark: data.landmark || null,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        is_default: data.is_default,
        updated_at: new Date().toISOString(),
      })
      .eq("public_id", publicId)
      .eq("user_id", userId);

    if (error) return { error: error.message };

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true };
  } catch (err) {
    return { error: err.message || "Failed to update address." };
  }
}

/**
 * Delete an address by public_id.
 */
export async function deleteAddressAction(publicId) {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUserId(supabase);

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("public_id", publicId)
      .eq("user_id", userId);

    if (error) return { error: error.message };

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true };
  } catch (err) {
    return { error: err.message || "Failed to delete address." };
  }
}

/**
 * Set an address as the default for the current user.
 */
export async function setDefaultAddressAction(publicId) {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUserId(supabase);

    // Clear existing defaults
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);

    // Set new default
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("public_id", publicId)
      .eq("user_id", userId);

    if (error) return { error: error.message };

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true };
  } catch (err) {
    return { error: err.message || "Failed to set default address." };
  }
}
