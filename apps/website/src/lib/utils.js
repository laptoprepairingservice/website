export { cn } from "@ui/shadcn/lib/utils";

export function getUserShortName(user) {
  const firstInit = user.first_name ? Array.from(user.first_name)[0] : "";
  const lastInit = user.last_name ? Array.from(user.last_name)[0] : "";
  return [firstInit, lastInit].filter(Boolean).join("").toUpperCase();
}
