"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUserAction } from "./_components/get-current-user-action";
import { normalizeEntitlements, normalizeUser } from "./user-config";

const AppContext = createContext(undefined);

const DEFAULT_TENANT = {
  name: "Ranuja",
  display_name: "Admin",
};

export function AppProvider({ children, org = DEFAULT_TENANT, user: initUser = null }) {
  const [tenant, setTenant] = useState(org);
  const [user, setUser] = useState(normalizeUser(initUser));
  const [entitlements, setEntitlements] = useState(normalizeEntitlements(initUser));

  useEffect(() => {
    setTenant(org);
  }, [org]);

  useEffect(() => {
    setUser(normalizeUser(initUser));
    setEntitlements(normalizeEntitlements(initUser));
  }, [initUser]);

  const refreshUser = useCallback(async () => {
    const nextUser = await getCurrentUserAction();
    setUser(normalizeUser(nextUser));
    setEntitlements(normalizeEntitlements(nextUser));
    return nextUser;
  }, []);

  const value = useMemo(
    () => ({
      tenant,
      user,
      refreshUser,
      entitlements,
      setEntitlements,
    }),
    [tenant, user, refreshUser, entitlements]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
