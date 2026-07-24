"use client";

import { useAppContext } from "@/app/_context";

export default function Can({ resource, action, children, sensitive = false }) {
  const { user, entitlements } = useAppContext() || {};
  const permissions = user?.permissions || {};
  const resourcePerms = permissions[resource] || [];
  const actions = Array.isArray(action) ? action : [action];
  const hasAccess = actions.some((a) => resourcePerms.includes(a));
  const canViewSensitive = entitlements?.isSensitiveVisible;

  if (!permissions[resource]) {
    console.warn(`No permission found for resource: ${resource}`);
    return null;
  }
  if (!hasAccess) return null;
  if (sensitive && !canViewSensitive) return null;

  return <>{children}</>;
}
