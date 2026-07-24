"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Reset link sent!", { description: "Check your email for instructions." });
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Forgot password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email" id="email">
          <Input id="email" type="email" required placeholder="you@example.com" />
        </FormField>
        <Button type="submit" size="lg" className="w-full">
          Send Reset Link
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
