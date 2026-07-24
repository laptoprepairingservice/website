"use client";

import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Newsletter({ className }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Subscribed!", { description: "You'll receive our latest deals and updates." });
    setEmail("");
  };

  return (
    <section className={`bg-primary text-primary-foreground ${className || ""}`}>
      <div className="container-store section-padding">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <Mail className="mb-4 size-8 opacity-80" />
          <h2 className="text-2xl font-semibold md:text-3xl">Stay Updated</h2>
          <p className="mt-2 text-sm opacity-80 md:text-base">
            Get exclusive deals, new product alerts, and PC building tips delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-0 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60"
            />
            <Button type="submit" variant="secondary" className="shrink-0">
              Subscribe
              <ArrowRight />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
