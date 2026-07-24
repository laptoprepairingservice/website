"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Password updated!", { description: "You can now sign in with your new password." });
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="New Password" id="password">
          <Input id="password" type="password" required placeholder="Min. 8 characters" minLength={8} />
        </FormField>
        <FormField label="Confirm Password" id="confirmPassword">
          <Input id="confirmPassword" type="password" required placeholder="Confirm password" minLength={8} />
        </FormField>
        <Button type="submit" size="lg" className="w-full">
          Update Password
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
