"use client";

import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    Cookies.remove("token");
    signOut({ redirect: false }).then(() => {
      router.replace("/login");
      router.refresh();
    });
  }, [router]);

  return <p className="p-8 text-sm text-muted-foreground">Signing out...</p>;
}
