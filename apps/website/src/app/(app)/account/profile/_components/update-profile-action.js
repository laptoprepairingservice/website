"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  phone: z.string().trim().min(8, "Enter a valid phone number"),
});

export async function updateProfileAction(formData) {
  const parsed = profileSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the form and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      phone: parsed.data.phone,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
