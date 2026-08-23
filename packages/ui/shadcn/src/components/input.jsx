import { cn } from "../lib/utils";
import { Label } from "./label";

function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn("input-base disabled:cursor-not-allowed disabled:opacity-50", className)}
      {...props}
    />
  );
}

function FormField({ label, id, error, children, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export { Input, FormField };
export { Textarea } from "./textarea";
export { Label } from "./label";
