"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@ui/shadcn/components/button";
import { FormField, Input } from "@ui/shadcn/components/input";
import { resetPasswordAction } from "@/lib/auth-actions";

export default function ResetPasswordPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError("");

    const result = await resetPasswordAction(new FormData(event.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="New Password" id="password">
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Min. 8 characters"
            minLength={8}
            autoComplete="new-password"
          />
        </FormField>
        <FormField label="Confirm Password" id="confirm_password">
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            placeholder="Confirm password"
            minLength={8}
            autoComplete="new-password"
          />
        </FormField>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Updating..." : "Update Password"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
