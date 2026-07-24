"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { NAV_LINKS, STORE } from "@/lib/store-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <AnnouncementBar />

      <div className="container-store">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>

            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                CV
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-semibold tracking-tight">{STORE.name}</span>
                <p className="text-xs text-muted-foreground">{STORE.location}</p>
              </div>
            </Link>
          </div>

          <div className="hidden flex-1 max-w-xl px-4 lg:block">
            <form action="/search" className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" placeholder="Search processors, GPUs, RAM, SSDs..." className="pl-10" />
            </form>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search />
            </Button>
            <Button variant="ghost" size="icon-sm" asChild aria-label="Wishlist">
              <Link href="/wishlist">
                <Heart />
              </Link>
            </Button>
            <Button variant="ghost" size="icon-sm" asChild aria-label="Cart" className="relative">
              <Link href="/cart">
                <ShoppingCart />
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  2
                </span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/login">
                <User />
                Login
              </Link>
            </Button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-border py-3 lg:hidden">
            <form action="/search" className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" placeholder="Search products..." className="pl-10" autoFocus />
            </form>
          </div>
        )}

        <nav className="hidden border-t border-border lg:block" aria-label="Main navigation">
          <ul className="flex h-12 items-center gap-1 overflow-x-auto hide-scrollbar">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="whitespace-nowrap px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div
        className={cn(
          "fixed inset-0 top-16 z-30 bg-background transition-transform duration-300 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="container-store space-y-1 py-4" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="block rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login / Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
