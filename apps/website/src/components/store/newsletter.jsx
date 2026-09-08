"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { Input } from "@ui/shadcn/components/input";
import { toast } from "sonner";

export function Newsletter({ className = "" }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);

    setTimeout(() => {
      toast.success("Subscribed successfully!", {
        description: "You'll now receive hardware restock alerts and offers.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <section className={`py-10 lg:py-14 ${className}`}>
      <div className="container">
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6 sm:p-10 text-center">
          <span className="mb-2 inline-block rounded border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Hardware Updates
          </span>

          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Stay Updated on Stock &amp; Price Drops
          </h2>

          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Get instant alerts for GPU restocks, flash drops, and new hardware arrivals in Ahmedabad.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex w-full max-w-md flex-col gap-2 sm:flex-row"
          >
            <Input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 text-xs sm:text-sm"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 shrink-0 font-medium"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
              <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 border-t border-border pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-foreground shrink-0" />
              <span>Priority GPU Drop Alerts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-foreground shrink-0" />
              <span>Weekly Benchmark Reviews</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-foreground shrink-0" />
              <span>No Spam Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
