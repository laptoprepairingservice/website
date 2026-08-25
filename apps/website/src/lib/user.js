import { createClient } from "./supabase/server";

export function mapAuthUser(user, profile = null) {
  const metadata = user.user_metadata || {};
  const first_name = metadata.first_name || "";
  const last_name = metadata.last_name || "";
  const phone = metadata.phone || "";
  const isGuest = user.is_anonymous === true || !user.email;

  return {
    id: user.id,
    email: user.email || null,
    first_name,
    last_name,
    phone,
    role: profile?.role || "customer",
    isGuest,
    name: [first_name, last_name].filter(Boolean).join(" ") || (isGuest ? "Guest" : user.email),
  };
}

export function getSafeNextPath(value) {
  if (value?.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/";
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return mapAuthUser(user);
}
