"use client";

import { logoutAction } from "@/app/(auth)/logout/_components/logout-action";
import { Button } from "@ui/shadcn/components/button";

export function LogoutButton({ variant = "outline", className, size, children }) {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant={variant} size={size} className={className}>
        {children ?? "Log out"}
      </Button>
    </form>
  );
}
