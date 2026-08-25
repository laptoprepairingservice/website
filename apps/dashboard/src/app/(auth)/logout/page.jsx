"use client";

import { useEffect } from "react";
import { logoutAction } from "./_components/logout-action";

export default function LogoutPage() {
  useEffect(() => {
    logoutAction();
  }, []);

  return <p className="text-muted-foreground text-sm">Signing out...</p>;
}
