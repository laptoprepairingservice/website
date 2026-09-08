import * as React from "react";
import { cn } from "@ui/shadcn/lib/utils";
import { Textarea } from "./textarea";

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  );
}

function FormField({ label, id, error, required, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export { Input, Textarea, FormField };
