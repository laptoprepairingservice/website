"use client";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
export default function Page() {
  useEffect(() => {
    Cookies.remove("token");
    signOut({ redirect: false });
    redirect("/login");
  }, []);
  return <div></div>;
}
