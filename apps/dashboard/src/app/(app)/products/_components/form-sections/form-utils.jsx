"use client";

import { AlertCircle } from "lucide-react";

export const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="text-destructive mt-1 flex items-center gap-1 text-xs font-medium">
      <AlertCircle className="size-3 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
