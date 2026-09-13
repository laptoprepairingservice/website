"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { cn } from "@/lib/utils";

export function FilterAccordion({
  title,
  children,
  defaultOpen = true,
  badge = null,
  className,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("border-border/70 border-b py-3.5 last:border-0", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-foreground hover:text-primary flex w-full items-center justify-between text-sm font-semibold transition-colors cursor-pointer"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {title}
          {badge != null && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-medium">
              {badge}
            </Badge>
          )}
        </span>
        <ChevronDown
          className={cn(
            "text-muted-foreground size-4 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="mt-3 space-y-2.5">{children}</div>}
    </div>
  );
}
