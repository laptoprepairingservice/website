import { CheckCircle2, CircleDot, Clock, Package, Truck, XCircle } from "lucide-react";

/* ─── Date formatter ───────────────────────────────────────────────────────── */

export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      ...opts,
    });
  } catch {
    return dateStr;
  }
}

/* ─── Avatar initials ──────────────────────────────────────────────────────── */

export function getInitials(firstName, lastName) {
  const f = firstName?.trim()?.[0]?.toUpperCase() ?? "";
  const l = lastName?.trim()?.[0]?.toUpperCase() ?? "";
  return f + l || "?";
}

/* ─── Role badge ───────────────────────────────────────────────────────────── */

export function getRoleBadgeProps(role) {
  switch (role?.toLowerCase()) {
    case "admin":
      return {
        variant: "outline",
        className:
          "border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-sm px-3 py-1",
      };
    case "customer":
      return {
        variant: "outline",
        className:
          "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-sm px-3 py-1",
      };
    default:
      return { variant: "secondary", className: "font-semibold text-sm px-3 py-1" };
  }
}

/* ─── Order status config ──────────────────────────────────────────────────── */

export const ORDER_STATUS = {
  pending: { icon: Clock, label: "Pending", variant: "warning", color: "text-amber-500", bg: "bg-amber-500/10" },
  confirmed: { icon: CircleDot, label: "Confirmed", variant: "secondary", color: "text-blue-500", bg: "bg-blue-500/10" },
  processing: { icon: CircleDot, label: "Processing", variant: "warning", color: "text-amber-500", bg: "bg-amber-500/10" },
  shipped: { icon: Truck, label: "Shipped", variant: "secondary", color: "text-blue-500", bg: "bg-blue-500/10" },
  delivered: { icon: CheckCircle2, label: "Delivered", variant: "success", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  cancelled: { icon: XCircle, label: "Cancelled", variant: "destructive", color: "text-rose-500", bg: "bg-rose-500/10" },
};

export function getOrderStatus(status) {
  return (
    ORDER_STATUS[status?.toLowerCase()] ?? {
      icon: Package,
      label: status || "Unknown",
      variant: "secondary",
      color: "text-muted-foreground",
      bg: "bg-muted",
    }
  );
}

/* ─── Avatar color palette ─────────────────────────────────────────────────── */

export const AVATAR_COLORS = [
  "bg-violet-500/20 text-violet-700 dark:text-violet-300",
  "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  "bg-rose-500/20 text-rose-700 dark:text-rose-300",
];
