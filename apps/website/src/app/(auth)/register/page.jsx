"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/form-controls";

export default function RegisterPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Account created!", { description: "Please verify your email." });
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
          <FormField label="First Name" id="firstName">
            <Input id="firstName" required placeholder="Rahul" />
          </FormField>
          <FormField label="Last Name" id="lastName">
            <Input id="lastName" required placeholder="Shah" />
          </FormField>
        </div>
        <FormField label="Email" id="email">
          <Input id="email" type="email" required placeholder="you@example.com" />
        </FormField>
        <FormField label="Phone" id="phone">
          <Input id="phone" type="tel" required placeholder="+91 98765 43210" />
        </FormField>
        <FormField label="Password" id="password">
          <Input
            id="password"
            type="password"
            required
            placeholder="Min. 8 characters"
            minLength={8}
          />
        </FormField>
        <Checkbox
          id="terms"
          label="I agree to the Terms & Conditions and Privacy Policy"
          required
        />
        <Button type="submit" size="lg" className="w-full">
          Create Account
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
