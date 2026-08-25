import { isAdminUser } from "./auth-role";
import { createClient } from "./supabase/server";

export { isAdminUser };

export function mapAuthUser(user) {
  const metadata = user.user_metadata || {};
  const first_name = metadata.first_name || "";
  const last_name = metadata.last_name || "";
  const phone = metadata.phone || "";
  const role = user.app_metadata?.role || "customer";

  return {
    id: user.id,
    email: user.email || null,
    first_name,
    last_name,
    phone,
    role,
    isAdmin: role === "admin",
    name: [first_name, last_name].filter(Boolean).join(" ") || user.email,
  };
}

export function getSafeNextPath(value) {
  if (value?.startsWith("/") && !value.startsWith("//") && value !== "/login") {
    return value;
  }
  return "/";
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user)) {
    return null;
  }

  return mapAuthUser(user);
}
