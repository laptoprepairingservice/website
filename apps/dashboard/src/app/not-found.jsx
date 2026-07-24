"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "ui/components/button";
import { Card } from "ui/components/card";
import { CircleAlert } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-16 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        <div className="mx-auto w-full border-muted/50">
          <div className="flex flex-col items-center gap-4 px-8 py-14 sm:gap-5 sm:px-10">
            <CircleAlert
              className="h-10 w-10 text-muted-foreground"
              aria-hidden="true"
            />
            <h1 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
              Page not found
            </h1>
            <p className="text-center text-sm text-muted-foreground sm:text-base">
              The page you are looking for doesn’t exist or has been moved.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/">Go home</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
