export const normalizeUser = (userData) => {
  if (!userData) return null;
  return {
    ...userData,
    isAdmin: userData.role === "admin" || userData.isAdmin === true,
  };
};

export const normalizeEntitlements = () => {
  return {
    isSensitiveVisible: false,
  };
};
