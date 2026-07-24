"use client";

import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const run = async () => {
      Cookies.remove("token");
      await signOut({ redirect: false });

      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl");
      const loginUrl = callbackUrl
        ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "/login";

      window.location.replace(loginUrl);
    };

    run();
  }, []);

  return null;
}
