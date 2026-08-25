"use server";

import { getCurrentUser } from "@/lib/user";

export async function getCurrentUserAction() {
  return getCurrentUser();
}
