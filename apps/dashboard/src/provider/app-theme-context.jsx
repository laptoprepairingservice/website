"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";

const AppThemeContext = createContext(undefined);

const STORAGE_KEY = "dashboard-theme";

function AppThemeBridge({ children }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const setMode = useCallback(
    (mode) => {
      if (mode === "light" || mode === "dark" || mode === "system") {
        setTheme(mode);
      }
    },
    [setTheme]
  );

  const toggleDark = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useEffect(() => {
    function onKeyDown(event) {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() !== "d") return;
      if (event.altKey || event.shiftKey) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      event.preventDefault();
      toggleDark();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleDark]);

  const value = useMemo(
    () => ({
      mode: theme ?? "system",
      setMode,
      resolvedMode: resolvedTheme,
      toggleDark,
    }),
    [theme, setMode, resolvedTheme, toggleDark]
  );

  return (
    <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
  );
}

export function AppThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey={STORAGE_KEY}
    >
      <AppThemeBridge>{children}</AppThemeBridge>
    </NextThemesProvider>
  );
}

export function useAppThemeContext() {
  const context = useContext(AppThemeContext);
  if (context === undefined) {
    throw new Error("useAppThemeContext must be used within an AppThemeProvider");
  }
  return context;
}
