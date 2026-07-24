"use client";

import { getUser } from "@/lib/auth/utils";
import { createContext, useContext, useState } from "react";
import { normalizeEntitlements, normalizeUser } from "./user-config";

const AppContext = createContext();

export function AppProvider({ children, org, user: initUser }) {
  const [tenant, setTenant] = useState(org);
  const [user, setUser] = useState(normalizeUser(initUser));
  const [entitlements, setEntitlements] = useState(normalizeEntitlements(initUser));

  const refreshUser = async () => {
    await getUser().then((res) => {
      setUser(normalizeUser(res));
      setEntitlements(normalizeEntitlements(res));
    });
  };

  const value = {
    tenant,
    user,
    refreshUser,
    entitlements,
    setEntitlements,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within a AppProvider");
  }
  return context;
}
