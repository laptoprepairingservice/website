export function isAdminUser(user) {
  return Boolean(
    user &&
      user.is_anonymous !== true &&
      user.email &&
      user.app_metadata?.role === "admin"
  );
}
