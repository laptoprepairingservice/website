"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "ui/components/dialog";
import { useEffect, useState } from "react";

export default function GlobalError({ error, reset }) {
  const [open, setOpen] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("App Error:", error);
    setOpen(true);
  }, [error]);

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleRefresh = () => {
    setOpen(false);
    reset();
  };

  const errorMessage = error?.message || "An unexpected error occurred.";
  const errorStack = error?.stack;
  const errorDetails = error?.toString();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-full flex flex-col">
        <DialogHeader>
          <DialogTitle>Something went wrong</DialogTitle>
          <DialogDescription className="mt-2">{errorMessage}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {(errorStack || errorDetails) && (
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-primary hover:underline"
              >
                {showDetails ? "Hide" : "Show"} details
              </button>

              {showDetails && (
                <div className="bg-muted p-4 rounded-md space-y-3">
                  {errorDetails && (
                    <div>
                      <p className="text-sm font-semibold mb-1">
                        Error Details:
                      </p>
                      <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                        {errorDetails}
                      </pre>
                    </div>
                  )}
                  {errorStack && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Stack Trace:</p>
                      <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                        {errorStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error?.digest && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Error ID: <span className="font-mono">{error.digest}</span>
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2 shrink-0">
          <button
            onClick={handleReload}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Reload Page
          </button>
          <button
            onClick={handleRefresh}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Refresh
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
