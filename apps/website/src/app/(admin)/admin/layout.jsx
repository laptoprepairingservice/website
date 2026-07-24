import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Settings,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STORE } from "@/lib/store-config";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Static Pages", icon: FileText },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar p-4 lg:block">
        <Link href="/admin" className="mb-8 flex items-center gap-2 px-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            CV
          </div>
          <div>
            <span className="text-sm font-semibold">Admin</span>
            <p className="text-xs text-muted-foreground">{STORE.name}</p>
          </div>
        </Link>
        <nav className="space-y-1">
          {ADMIN_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-border pt-4">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/">View Store</Link>
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-muted/20 p-6 lg:p-8">{children}</main>
    </div>
  );
}
