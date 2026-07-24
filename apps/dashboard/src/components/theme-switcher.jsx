"use client";

import { THEME_REGISTRY } from "@/lib/theme-registry";
import { useAppThemeContext } from "@/provider/app-theme-context";
import { cn } from "@/lib/utils";
import { Button } from "ui/components/button";

/**
 * Palette buttons: applies `theme-{id}` on `<html>`.
 */
export function ThemeSwitcher({ className }) {
  const { theme, changeTheme } = useAppThemeContext();

  return (
    <div
      className={cn("flex max-w-xl flex-wrap items-center gap-1", className)}
      role="group"
      aria-label="Color theme"
    >
      {THEME_REGISTRY.map((t) => (
        <Button
          key={t.id}
          type="button"
          variant={theme === t.id ? "default" : "outline"}
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => changeTheme(t.id)}
          aria-pressed={theme === t.id}
          style={{ backgroundColor: t.color }}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}
