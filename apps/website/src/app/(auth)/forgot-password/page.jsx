"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@ui/shadcn/components/button";
import { FormField, Input } from "@ui/shadcn/components/input";
import { forgotPasswordAction } from "@/lib/auth-actions";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError("");
    setSuccess(false);

    const result = await forgotPasswordAction(new FormData(event.currentTarget));
    setPending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Forgot password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {success ? (
        <p className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
          If an account exists for that email, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
