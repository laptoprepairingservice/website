"use client";

import { createContext, useContext, useMemo, useState } from "react";

const BreadcrumbContext = createContext(null);

export function BreadcrumbProvider({ children }) {
  const [items, setItems] = useState([]);

  const value = useMemo(
    () => ({
      items,
      setItems,
    }),
    [items]
  );

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);

  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }

  return context;
}
