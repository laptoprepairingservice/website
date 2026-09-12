"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@ui/shadcn/components/button";
import { FormField } from "@ui/shadcn/components/form-field";
import { Input } from "@ui/shadcn/components/input";
import { Checkbox } from "@ui/shadcn/components/form-controls";
import { signupAction } from "./_components/signup-action";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError("");

    const result = await signupAction(new FormData(event.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Join Ranuja for exclusive deals and order tracking
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First Name" id="first_name">
            <Input id="first_name" name="first_name" required placeholder="Rahul" autoComplete="given-name" />
          </FormField>
          <FormField label="Last Name" id="last_name">
            <Input id="last_name" name="last_name" required placeholder="Shah" autoComplete="family-name" />
          </FormField>
        </div>
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
        <FormField label="Phone" id="phone">
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+91 98765 43210"
            autoComplete="tel"
          />
        </FormField>
        <FormField label="Password" id="password">
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
        <Checkbox
          id="terms"
          name="terms"
          label="I agree to the Terms & Conditions and Privacy Policy"
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
