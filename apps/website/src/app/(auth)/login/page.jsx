"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/form-controls";

export default function LoginPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Welcome back!");
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-muted-foreground mt-2 text-sm">Sign in to your Ranuja account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email" id="email">
          <Input id="email" type="email" required placeholder="you@example.com" />
        </FormField>
        <FormField label="Password" id="password">
          <Input id="password" type="password" required placeholder="••••••••" />
        </FormField>
        <div className="flex items-center justify-between">
          <Checkbox id="remember" label="Remember me" />
          <Link href="/forgot-password" className="text-primary text-sm hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full">
          Sign In
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
