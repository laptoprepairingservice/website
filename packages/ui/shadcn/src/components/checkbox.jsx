"use client";

import { cn } from "../lib/utils";

function Checkbox({ className, label, id, ...props }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        id={id}
        data-slot="checkbox"
        className={cn(
          "size-4 rounded border border-input accent-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}

export { Checkbox };
