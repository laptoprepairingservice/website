export { cn } from "@ui/shadcn/lib/utils";

export function getUserShortName(user) {
  if (!user) return "";
  const firstInit = user.first_name ? Array.from(user.first_name)[0] : "";
  const lastInit = user.last_name ? Array.from(user.last_name)[0] : "";
  const initials = [firstInit, lastInit].filter(Boolean).join("").toUpperCase();
  if (initials) return initials;

  if (user.name && user.name !== user.email && user.name !== "Guest") {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || "U";
  }

  if (user.email) {
    return user.email[0].toUpperCase();
  }

  return "U";
}

