"use client";

import { cn } from "@/lib/utils";
import { useAppThemeContext } from "@/provider/app-theme-context";
import { Button } from "@ui/shadcn/components/button";
import { Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const MODES = [
  { value: "light", label: "Light mode", icon: Sun },
  { value: "dark", label: "Dark mode", icon: Moon },
  { value: "system", label: "System mode", icon: Laptop },
];

/**
 * Light / dark / system — toggles `.dark` on `<html>` (class-based dark mode).
 * Shortcut: Ctrl/Cmd+D toggles light ↔ dark.
 */
export function ModeToggle({ className }) {
  const { mode, setMode } = useAppThemeContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const value = mode === "system" ? "system" : mode;

  return (
    <div
      className={cn("inline-flex items-center rounded-lg border p-0.5", className)}
      role="group"
      aria-label="Color mode"
      title="Toggle dark mode (Ctrl+D)"
    >
      {MODES.map(({ value: itemValue, label, icon: Icon }) => (
        <Button
          key={itemValue}
          type="button"
          variant={mounted && value === itemValue ? "secondary" : "ghost"}
          size="icon-sm"
          className="size-8"
          aria-label={label}
          aria-pressed={mounted ? value === itemValue : false}
          onClick={() => setMode(itemValue)}
        >
          <Icon className="size-4" />
        </Button>
      ))}
    </div>
  );
}
