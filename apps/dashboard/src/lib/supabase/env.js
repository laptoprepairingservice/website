export function getSupabaseUrl() {
  // Must be a static `process.env.NEXT_PUBLIC_*` access — dynamic keys are not
  // inlined into the client bundle by Next.js.
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }
  return value;
}

export function getSupabaseAnonKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
  }

  return value;
}

export function getAppUrl() {
  return process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3003";
}
