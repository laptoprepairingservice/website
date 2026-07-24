export const normalizeUser = (userData) => {
  if (!userData) return null;
  return {
    ...userData,
    isAdmin: userData.user_type == "admin" ? true : false,
  };
};

export const normalizeEntitlements = (userData) => {
  if (!userData) return null;
  return {
    isSensitiveVisible: false,
  };
};
