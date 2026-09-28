"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Heart,
  User,
} from "lucide-react";
import { cn } from "@ui/shadcn/lib/utils";

const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/account", icon: LayoutDashboard, exact: true },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "Profile", href: "/account/profile", icon: User },
];

export function AccountMobileNav() {
  const pathname = usePathname();

  const isActive = (href, exact) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
      <div className="grid grid-cols-5">
        {MOBILE_NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-3 text-center transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className={cn(
                "relative flex h-6 w-6 items-center justify-center",
              )}>
                {active && (
                  <span className="absolute inset-0 rounded-md bg-primary/10" />
                )}
                <Icon className="size-5 relative" />
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-none",
                active ? "font-semibold" : "",
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
