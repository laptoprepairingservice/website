import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md space-y-8 text-center lg:text-left">
      <div className="bg-success/10 mx-auto flex size-16 items-center justify-center rounded-full lg:mx-0">
        <CheckCircle className="text-success size-8" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold">Email verified!</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your email has been successfully verified. You can now access all features of your Ranuja
          account.
        </p>
      </div>
      <Button size="lg" asChild>
        <Link href="/account">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
