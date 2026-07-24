"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Truck,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ACCOUNT_LINKS } from "@/lib/store-config";
import { cn } from "@/lib/utils";

const ICONS = {
  LayoutDashboard,
  User,
  MapPin,
  Heart,
  Package,
  Truck,
};

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="container-store flex-1 py-8 lg:py-12">
        <Button variant="outline" className="mb-6 lg:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu />
          Account Menu
        </Button>

        <div className="flex gap-8">
          <aside
            className={cn(
              "border-border bg-background fixed inset-y-0 left-0 w-64 border-r p-6 transition-transform lg:static lg:block lg:translate-x-0 lg:rounded-xl lg:border lg:p-4",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <span className="font-semibold">My Account</span>
              <Button variant="ghost" size="icon-sm" onClick={() => setSidebarOpen(false)}>
                <X />
              </Button>
            </div>
            <nav className="space-y-1">
              {ACCOUNT_LINKS.map((link) => {
                const Icon = ICONS[link.icon];
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/logout"
                className="text-destructive hover:bg-destructive/10 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
              >
                <LogOut className="size-4" />
                Logout
              </Link>
            </nav>
          </aside>

          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
          )}

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
