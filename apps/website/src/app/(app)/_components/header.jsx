"use client";

import { useAppContext } from "@/app/_context";
import { getUserShortName } from "@/lib/utils";
import { Button } from "@ui/shadcn/components/button";
import { Input } from "@ui/shadcn/components/input";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { AnnouncementBar } from "./announcement-bar";

function SearchForm({ className }) {
  return (
    <form action="/search" className={className}>
      <div className="relative">
        <Input name="q" placeholder="Search processors, GPUs, RAM, SSDs..." className="pl-10" />
      </div>
    </form>
  );
}

export function Header() {
  const { user, cartCount, wishlistCount } = useAppContext();

  const isSignedIn = Boolean(user && !user.isGuest);
  const accountHref = isSignedIn ? "/account" : "/login";
  const accountLabel = isSignedIn ? getUserShortName(user) : "Login";

  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur-md">
      <AnnouncementBar />

      <div className="container">
        <div className="flex h-14 items-center justify-between gap-3 sm:h-16 lg:h-20">
          {/* Left side */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link href="/" className="flex min-w-0 items-center gap-2">
              <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold sm:size-9">
                CV
              </div>
              <div className="hidden min-w-0 sm:block">
                <span className="text-lg font-semibold tracking-tight">Ranuja</span>
                <p className="text-muted-foreground text-xs">Ahmedabad</p>
              </div>
            </Link>
          </div>

          {/* Desktop search */}
          <SearchForm className="hidden max-w-xl flex-1 px-4 md:block" />

          {/* Right side */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              aria-label="Wishlist"
              className="relative"
            >
              <Link href="/wishlist">
                <Heart />
                {wishlistCount > 0 && (
                  <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium leading-none">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon-sm" asChild aria-label="Cart" className="relative">
              <Link href="/cart">
                <ShoppingCart />
                {cartCount > 0 && (
                  <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="hidden rounded-full sm:inline-flex"
              asChild
            >
              <Link href={accountHref}>{accountLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
