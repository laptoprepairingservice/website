import { AlertTriangle } from "lucide-react";
import { Button } from "ui/components/button";

export default function Error({ error }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-destructive/40 bg-background p-12 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-destructive/50 bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>

      <h3 className="text-lg font-semibold text-foreground">
        Something went wrong
      </h3>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {error?.message ||
          "An unexpected error occurred while processing your request."}
      </p>

      {error?.name && (
        <p className="mt-3 text-xs text-muted-foreground">
          {error.name} : {error?.message}
        </p>
      )}
    </div>
  );
}
