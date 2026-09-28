"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Heart,
  User,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { cn } from "@ui/shadcn/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/account",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Orders",
    href: "/account/orders",
    icon: Package,
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    label: "Wishlist",
    href: "/account/wishlist",
    icon: Heart,
  },
  {
    label: "Profile",
    href: "/account/profile",
    icon: User,
  },
];

function UserAvatar({ firstName, lastName, size = "lg" }) {
  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`
      : firstName
        ? firstName[0]
        : "U";

  const sizeClass =
    size === "lg"
      ? "h-12 w-12 text-base"
      : "h-8 w-8 text-sm";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground",
        sizeClass,
      )}
    >
      {initials.toUpperCase()}
    </div>
  );
}

export function AccountSidebar({ firstName, lastName, email }) {
  const pathname = usePathname();

  const isActive = (href, exact) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* User profile section */}
      <div className="border-b border-border bg-sidebar/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar firstName={firstName} lastName={lastName} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-sm leading-tight text-foreground">
              {[firstName, lastName].filter(Boolean).join(" ") || "My Account"}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="p-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className={cn("size-4 shrink-0", active ? "text-primary-foreground" : "")} />
              <span className="flex-1">{label}</span>
              <ChevronRight
                className={cn(
                  "size-3.5 transition-opacity",
                  active ? "opacity-60" : "opacity-0 group-hover:opacity-40",
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-3">
        <LogoutButton
          variant="ghost"
          className="w-full justify-start gap-3 text-sm text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </LogoutButton>
      </div>
    </div>
  );
}
