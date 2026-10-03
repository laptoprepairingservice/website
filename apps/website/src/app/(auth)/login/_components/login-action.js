"use server";

import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSafeNextPath, mapAuthUser } from "@/lib/user";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function loginAction(formData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the form and try again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message?.toLowerCase().includes("email not confirmed")) {
      return { error: "Please verify your email before signing in." };
    }
    return { error: "Invalid email or password." };
  }

  const nextPath = getSafeNextPath(formData.get("next"));

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (signInError) {
    if (signInError instanceof AuthError) {
      const cause = signInError.cause?.err?.message || signInError.cause?.message || "";
      if (String(cause).includes("EMAIL_NOT_CONFIRMED")) {
        return { error: "Please verify your email before signing in." };
      }
      return { error: "Invalid email or password." };
    }
    if (!signInError?.digest?.startsWith?.("NEXT_REDIRECT")) {
      console.error("signIn error:", signInError);
    }
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    redirectTo: nextPath,
    user: data?.user ? mapAuthUser(data.user) : null,
  };
}
