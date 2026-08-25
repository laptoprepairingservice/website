"use client";

import { useEffect } from "react";
import { logoutAction } from "./_components/logout-action";

export default function LogoutPage() {
  useEffect(() => {
    logoutAction();
  }, []);

  return <p className="p-8 text-sm text-muted-foreground">Signing out...</p>;
}
