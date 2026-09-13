import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

let publicSupabase = null;

/**
 * Returns a singleton public Supabase client without session persistence,
 * suitable for public read-only store data queries in Server Components and actions.
 */
export function getPublicSupabaseClient() {
  if (!publicSupabase) {
    publicSupabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return publicSupabase;
}
