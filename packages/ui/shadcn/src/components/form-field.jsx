import { cn } from "../lib/utils";
import { Label } from "./label";

function FormField({ label, id, error, children, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      {children}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}

export { FormField };
