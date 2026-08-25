"use server";

import { z } from "zod";
import { signIn } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(8, "Confirm your password"),
});

export async function resetPasswordAction(formData) {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the form and try again." };
  }

  if (parsed.data.password !== parsed.data.confirm_password) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  await signIn("credentials", {
    email: user.email,
    password: parsed.data.password,
    redirectTo: "/",
  });
}
