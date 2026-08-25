"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@ui/shadcn/components/button";
import { createClient } from "@/lib/supabase/client";

function getSafeNext(value, type) {
  if (value?.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return type === "recovery" ? "/reset-password" : "/login?verified=1";
}

export default function ConfirmClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function confirmAuth() {
      const supabase = createClient();
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const type = searchParams.get("type") || hashParams.get("type");
      const next = getSafeNext(searchParams.get("next"), type);
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash") || hashParams.get("token_hash");
      const supabaseError = searchParams.get("error_description") || searchParams.get("error");

      if (supabaseError) {
        if (!cancelled) setError(supabaseError.replace(/\+/g, " "));
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchangeError) {
          if (!cancelled) router.replace(next);
          return;
        }
      }

      if (tokenHash && type) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          type,
          token_hash: tokenHash,
        });
        if (!otpError) {
          if (!cancelled) router.replace(next);
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        if (!cancelled) router.replace(next);
        return;
      }

      if (!cancelled) {
        setError("This confirmation link is invalid or has expired.");
      }
    }

    confirmAuth();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="w-full max-w-md space-y-6 text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Verification failed</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button size="lg" asChild>
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6 text-center lg:text-left">
      <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-primary lg:mx-0" />
      <div>
        <h1 className="text-2xl font-semibold">Verifying...</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please wait while we confirm your email.</p>
      </div>
    </div>
  );
}
