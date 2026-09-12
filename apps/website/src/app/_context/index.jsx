"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUserAction } from "./_components/get-current-user-action";

const AppContext = createContext(undefined);

export function AppProvider({ children, user: initUser = null }) {
  const [user, setUser] = useState(initUser);

  const [prevInitUser, setPrevInitUser] = useState(initUser);

  if (initUser !== prevInitUser) {
    setPrevInitUser(initUser);
    setUser(initUser);
  }

  const refreshUser = useCallback(async () => {
    const nextUser = await getCurrentUserAction();
    setUser(nextUser);
    return nextUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      refreshUser,
    }),
    [user, refreshUser]
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
