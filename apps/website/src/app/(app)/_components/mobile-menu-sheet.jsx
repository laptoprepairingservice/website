"use client";

import Link from "next/link";
import { Menu, User } from "lucide-react";

import { Button } from "@ui/shadcn/components/button";
import { Input } from "@ui/shadcn/components/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@ui/shadcn/components/sheet";

import { NAV_LINKS, STORE } from "@/lib/store-config";

function SearchForm({ className }) {
  return (
    <form action="/search" className={className}>
      <div className="relative">
        <Input name="q" placeholder="Search processors, GPUs, RAM, SSDs..." className="pl-10" />
      </div>
    </form>
  );
}

export function MobileMenuSheet({ accountHref, accountLabel, isSignedIn }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-full gap-0 p-0 sm:max-w-xs">
        <SheetHeader className="border-border border-b p-4 pr-12 text-left">
          <SheetTitle>{STORE.name}</SheetTitle>
          <SheetDescription>{STORE.location}</SheetDescription>
        </SheetHeader>

        <div className="p-4 md:hidden">
          <SearchForm />
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-4"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className="hover:bg-accent rounded-lg px-3 py-2.5 text-sm font-medium"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <SheetFooter className="border-border border-t sm:hidden">
          <SheetClose asChild>
            <Button variant="outline" asChild>
              <Link href={accountHref}>
                <User />
                {isSignedIn ? accountLabel : "Login / Register"}
              </Link>
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
