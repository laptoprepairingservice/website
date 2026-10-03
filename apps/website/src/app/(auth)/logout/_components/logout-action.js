"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  await signOut({ redirectTo: "/login" });
}
