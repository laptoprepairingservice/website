"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className, variant = "segmented" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("inline-flex h-9 items-center rounded-xl border border-border bg-background/50 p-1 opacity-50", className)}>
        <div className="size-7 rounded-lg bg-muted/60" />
      </div>
    );
  }

  if (variant === "compact") {
    const isDark = theme === "dark";
    return (
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={cn(
          "flex size-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-all hover:bg-accent hover:text-accent-foreground",
          className
        )}
        aria-label="Toggle theme"
      >
        {isDark ? <Moon className="size-4 text-primary" /> : <Sun className="size-4 text-amber-500" />}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-border/80 bg-background/80 p-1 shadow-2xs backdrop-blur-xs",
        className
      )}
      role="radiogroup"
      aria-label="Theme mode"
    >
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
          theme === "light"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
        role="radio"
        aria-checked={theme === "light"}
        aria-label="Light mode"
      >
        <Sun className="size-3.5" />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        onClick={() => setTheme("system")}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
          theme === "system"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
        role="radio"
        aria-checked={theme === "system"}
        aria-label="System mode"
      >
        <Laptop className="size-3.5" />
        <span className="hidden sm:inline">System</span>
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
          theme === "dark"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
        role="radio"
        aria-checked={theme === "dark"}
        aria-label="Dark mode"
      >
        <Moon className="size-3.5" />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
}
