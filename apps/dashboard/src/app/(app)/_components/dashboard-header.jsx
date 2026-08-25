"use client";

import Link from "next/link";
import { Button } from "@ui/shadcn/components/button";
import { useAppContext } from "@/app/_context";

export function DashboardHeader() {
  const { user } = useAppContext();

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <div>
        <p className="text-muted-foreground text-sm">Ranuja Admin</p>
        <p className="font-semibold">{user?.name || user?.email}</p>
      </div>
      <Button asChild variant="outline">
        <Link href="/logout">Log out</Link>
      </Button>
    </header>
  );
}
