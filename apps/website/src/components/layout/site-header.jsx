"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { Input } from "@ui/shadcn/components/input";
import { useAppContext } from "@/app/_context";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { NAV_LINKS, STORE } from "@/lib/store-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { user } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 w-full border-b backdrop-blur-md">
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
              <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg text-sm font-bold">
                CV
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-semibold tracking-tight">{STORE.name}</span>
                <p className="text-muted-foreground text-xs">{STORE.location}</p>
              </div>
            </Link>
          </div>

          <div className="hidden max-w-xl flex-1 px-4 lg:block">
            <form action="/search" className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                name="q"
                placeholder="Search processors, GPUs, RAM, SSDs..."
                className="pl-10"
              />
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
                <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
                  2
                </span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href={user ? "/account" : "/login"}>
                <User />
                {user ? "Account" : "Login"}
              </Link>
            </Button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-border border-t py-3 lg:hidden">
            <form action="/search" className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input name="q" placeholder="Search products..." className="pl-10" autoFocus />
            </form>
          </div>
        )}

        <nav className="border-border hidden border-t lg:block" aria-label="Main navigation">
          <ul className="hide-scrollbar flex h-12 items-center gap-1 overflow-x-auto">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
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
          "bg-background fixed inset-0 top-16 z-30 transition-transform duration-300 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="container-store space-y-1 py-4" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:bg-accent block rounded-lg px-4 py-3 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={user ? "/account" : "/login"}
            className="hover:bg-accent block rounded-lg px-4 py-3 text-sm font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            {user ? "Account" : "Login / Register"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
