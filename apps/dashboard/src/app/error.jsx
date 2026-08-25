"use client";

import { useEffect, useState } from "react";
import { Button } from "@ui/shadcn/components/button";

export default function GlobalError({ error, reset }) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  const errorMessage = error?.message || "An unexpected error occurred.";

  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-6">
      <div className="bg-card w-full max-w-lg space-y-4 rounded-xl border p-6 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground mt-2 text-sm">{errorMessage}</p>
        </div>

        {(error?.stack || error?.toString?.()) && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowDetails((value) => !value)}
              className="text-primary text-sm hover:underline"
            >
              {showDetails ? "Hide" : "Show"} details
            </button>
            {showDetails && (
              <pre className="bg-muted overflow-x-auto rounded-md border p-3 text-xs">
                {error?.stack || String(error)}
              </pre>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
