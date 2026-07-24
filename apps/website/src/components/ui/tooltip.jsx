"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Tooltip({ content, children, className }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md"
        >
          {content}
        </span>
      )}
    </span>
  );
}
