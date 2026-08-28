export function formatSupabaseError(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage;
  }

  if (error.code === "23505") {
    return "A unique field value is already in use.";
  }

  if (error.code === "23503") {
    return "This record is still in use and cannot be deleted.";
  }

  return error.message || fallbackMessage;
}
