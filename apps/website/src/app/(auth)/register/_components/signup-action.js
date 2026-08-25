"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import { getAppUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const signupSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(8, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signupAction(formData) {
  const parsed = signupSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the form and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const userMetadata = {
    first_name: parsed.data.first_name,
    last_name: parsed.data.last_name,
    phone: parsed.data.phone,
  };

  if (currentUser?.is_anonymous) {
    const { error } = await supabase.auth.updateUser(
      {
        email: parsed.data.email,
        password: parsed.data.password,
        data: userMetadata,
      },
      {
        emailRedirectTo: `${getAppUrl()}/auth/confirm?next=${encodeURIComponent("/login?verified=1")}`,
      },
    );

    if (error) {
      return { error: error.message };
    }
  } else {
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${getAppUrl()}/auth/confirm?next=${encodeURIComponent("/login?verified=1")}`,
        data: userMetadata,
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user?.identities && data.user.identities.length === 0) {
      return { error: "An account with this email already exists." };
    }
  }

  const {
    data: { user: nextUser },
  } = await supabase.auth.getUser();

  if (!nextUser || nextUser.is_anonymous || !nextUser.email) {
    redirect("/verify-email");
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (signInError) {
    if (signInError instanceof AuthError) {
      const cause = signInError.cause?.err?.message || signInError.cause?.message || "";
      if (String(cause).includes("EMAIL_NOT_CONFIRMED")) {
        return { error: "Please verify your email before signing in." };
      }
      return { error: "Invalid email or password." };
    }
    throw signInError;
  }
}
