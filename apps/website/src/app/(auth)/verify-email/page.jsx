import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md space-y-8 text-center lg:text-left">
      <div className="bg-success/10 mx-auto flex size-16 items-center justify-center rounded-full lg:mx-0">
        <Mail className="text-success size-8" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          We sent a confirmation link to your email. Open it to verify your account before signing
          in.
        </p>
      </div>
      <Button size="lg" asChild>
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}
