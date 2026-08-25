"use client";

import { logoutAction } from "@/app/(auth)/logout/_components/logout-action";
import { Button } from "@ui/shadcn/components/button";

export function LogoutButton({ variant = "outline" }) {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant={variant}>
        Log out
      </Button>
    </form>
  );
}
