"use client";

import { useAppThemeContext } from "@/provider/app-theme-context";
import { cn } from "@/lib/utils";
import { Laptop, Moon, Sun } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "ui/components/toggle-group";

/**
 * Light / dark / system — toggles `.dark` on `<html>` (class-based dark mode).
 */
export function ModeToggle({ className }) {
  const { mode, setMode } = useAppThemeContext();

  const value = mode === "system" ? "system" : mode;

  return (
    <ToggleGroup
      type="single"
      className={cn(className)}
      value={value}
      onValueChange={(v) => v && setMode(v)}
      variant="outline"
      size="sm"
      spacing={0}
      aria-label="Color mode"
    >
      <ToggleGroupItem value="light" aria-label="Light mode">
        <Sun className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark mode">
        <Moon className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label="System mode">
        <Laptop className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
