import { Suspense } from "react";
import ConfirmClient from "./confirm-client";

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md space-y-6 text-center lg:text-left">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-primary lg:mx-0" />
          <h1 className="text-2xl font-semibold">Verifying...</h1>
        </div>
      }
    >
      <ConfirmClient />
    </Suspense>
  );
}
