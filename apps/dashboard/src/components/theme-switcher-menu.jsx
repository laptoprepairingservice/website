import { THEME_REGISTRY } from "@/lib/theme-registry";
import React from "react";
import { useAppThemeContext } from "@/provider/app-theme-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "ui/components/ui/tooltip";

export function ThemeSwitcherMenu() {
  const { changeTheme, theme } = useAppThemeContext();
  return (
    <div className="flex w-full cursor-pointer justify-center gap-4 p-2 hover:bg-transparent!">
      {THEME_REGISTRY.map((t) => (
        <Tooltip key={t.id} content={theme === t.id ? "Current theme" : t.label}>
          <TooltipTrigger>
            <div
              key={t.id}
              onClick={(e) => {
                e.preventDefault();
                changeTheme(t.id);
              }}
              className={theme === t.id ? "border-primary animate-pulse rounded-full" : ""}
            >
              <div style={{ backgroundColor: t.color }} className="size-4 rounded-full" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="flex flex-col items-center gap-2">
            {theme === t.id ? <span>Current theme</span> : <></>}
            {t.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
