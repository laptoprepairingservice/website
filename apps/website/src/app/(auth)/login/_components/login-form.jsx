"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@ui/shadcn/components/button";
import { FormField } from "@ui/shadcn/components/form-field";
import { Input } from "@ui/shadcn/components/input";
import { Checkbox } from "@ui/shadcn/components/form-controls";
import { loginAction } from "./login-action";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const verified = searchParams.get("verified") === "1";
  const nextPath = searchParams.get("next") || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError("");

    const result = await loginAction(new FormData(event.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-muted-foreground mt-2 text-sm">Sign in to your Ranuja account</p>
      </div>

      {verified && (
        <p className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
          Email verified. You can now sign in.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="next" value={nextPath} />
        <FormField label="Email" id="email">
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
          />
        </FormField>
        <FormField label="Password" id="password">
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </FormField>
        <div className="flex items-center justify-between">
          <Checkbox id="remember" name="remember" label="Remember me" />
          <Link href="/forgot-password" className="text-primary text-sm hover:underline">
            Forgot password?
          </Link>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
