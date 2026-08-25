"use server";

import { signOut } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await signOut({ redirectTo: "/login" });
}
