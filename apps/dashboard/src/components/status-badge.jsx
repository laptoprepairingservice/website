"use client";

import { IconBadge } from "ui/components/badge";
import { cn } from "@/lib/utils";

/**
 * Default status config: status key -> { icon, iconClassName, label }
 * Override or extend via the config prop.
 */
const DEFAULT_STATUS_CONFIG = {
  true: {
    icon: "mdi:play-circle-outline",
    iconClassName: "text-green-500",
    label: "Active",
  },
  false: {
    icon: "mdi:pause-circle-outline",
    iconClassName: "text-red-500",
    label: "Inactive",
  },
  pending: {
    icon: "mdi:clock-outline",
    iconClassName: "text-amber-500",
    label: "Pending",
  },
  approved: {
    icon: "mdi:check-circle-outline",
    iconClassName: "text-green-500",
    label: "Approved",
  },
  rejected: {
    icon: "mdi:close-circle-outline",
    iconClassName: "text-red-500",
    label: "Rejected",
  },
  cancelled: {
    icon: "mdi:cancel",
    iconClassName: "text-gray-500",
    label: "Cancelled",
  },
  active: {
    icon: "mdi:play-circle-outline",
    iconClassName: "text-blue-500",
    label: "Active",
  },
  present: {
    icon: "mdi:check-circle-outline",
    iconClassName: "text-green-500",
    label: "Present",
  },
  absent: {
    icon: "mdi:close-circle-outline",
    iconClassName: "text-red-500",
    label: "Absent",
  },
  late: {
    icon: "mdi:clock-outline",
    iconClassName: "text-amber-500",
    label: "Late",
  },
  excused: {
    icon: "mdi:information-outline",
    iconClassName: "text-purple-500",
    label: "Excused",
  },
  locked: {
    icon: "mdi:lock-outline",
    iconClassName: "text-yellow-500",
    label: "Locked",
  },
  unlocked: {
    icon: "mdi:lock-open-outline",
    iconClassName: "text-green-500",
    label: "Unlocked",
  },
  occupied: {
    icon: "ooui:block",
    iconClassName: "text-amber-500",
    label: "Occupied",
  },
  available: {
    icon: "fluent:presence-available-24-filled",
    iconClassName: "text-green-500",
    label: "Available",
  },
};

const FALLBACK = {
  icon: "mdi:help-circle-outline",
  iconClassName: "text-gray-500",
  label: "N/A",
};

/**
 * Configurable, reusable status badge.
 * @param {string} status - Raw status value (e.g. "pending", "approved")
 * @param {Object} config - Optional. Map of status -> { icon, iconClassName, label }. Merged with defaults.
 * @param {string} variant - Badge variant (default "outline")
 * @param {string} fallbackLabel - Label when status is null/undefined (default "N/A")
 * @param {string} className - Additional class names for the badge
 * @param {string} iconClassName - Override icon color/class for this render
 */
export function StatusBadge({
  label,
  status,
  config = {},
  variant = "outline",
  fallbackLabel = "N/A",
  icon = null,
  className,
  iconClassName,
  ...props
}) {
  const mergedConfig = { ...DEFAULT_STATUS_CONFIG, ...config };
  const key = status === undefined || status === null ? null : String(status).toLowerCase();
  const resolved = key && mergedConfig[key] ? mergedConfig[key] : FALLBACK;

  const defaultLabel =
    key && mergedConfig[key]
      ? resolved.label
      : status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : fallbackLabel;

  return (
    <IconBadge
      variant={variant}
      icon={icon || resolved.icon}
      iconClassName={cn(resolved.iconClassName, iconClassName)}
      className={className}
      {...props}
    >
      {label || defaultLabel}
    </IconBadge>
  );
}
