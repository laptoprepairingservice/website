"use client";

import { useAppContext } from "@/app/_context";
import { getUserShortName } from "@/lib/utils";
import { Button } from "@ui/shadcn/components/button";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { AnnouncementBar } from "../announcement-bar";

import { MobileNavSheet } from "./mobile-nav-sheet";
import { SearchCombobox } from "./search-combobox";
import Image from "next/image";

export function Header({ categories = [] }) {
  const { user, cartCount, wishlistCount } = useAppContext();

  const isSignedIn = Boolean(user && !user.isGuest);
  const accountHref = isSignedIn ? "/account" : "/login";
  const accountLabel = isSignedIn ? getUserShortName(user) : "Login";

  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur-md">
      {/* <AnnouncementBar /> */}

      <div className="container">
        <div className="flex h-14 items-center justify-between gap-3 sm:h-16 lg:h-20">
          {/* Left side: Mobile Menu Trigger + Store Logo */}
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-4">
            <MobileNavSheet initialCategories={categories} />

            <Link href="/" className="flex aspect-video min-w-0 items-center gap-2">
              <Image
                src="/logo.png"
                alt="logo"
                width={100}
                height={100}
                className="object-contain"
              />
            </Link>
          </div>

          {/* Desktop search combobox */}
          <SearchCombobox className="hidden max-w-xl flex-1 px-4 md:block" />

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
                  <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-medium">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon-sm" asChild aria-label="Cart" className="relative">
              <Link href="/cart">
                <ShoppingCart />
                {cartCount > 0 && (
                  <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-medium">
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
