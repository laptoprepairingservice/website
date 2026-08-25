"use server";

import { z } from "zod";
import { getAppUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export async function forgotPasswordAction(formData) {
  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the form and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getAppUrl()}/auth/confirm?next=${encodeURIComponent("/reset-password")}`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
