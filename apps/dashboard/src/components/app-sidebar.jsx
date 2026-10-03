"use client";

import { LayoutDashboard, Newspaper, Package, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { useAppContext } from "@/app/_context";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@ui/shadcn/components/sidebar";
import packageJson from "../../package.json";
import Image from "next/image";
import { Package2 } from "lucide-react";

export function AppSidebar({ ...props }) {
  const { user } = useAppContext();
  const pathname = usePathname();

  const data = useMemo(
    () => ({
      user,
      navMain: [
        {
          title: "Overview",
          url: "/",
          icon: LayoutDashboard,
          isActive: pathname === "/",
        },
        {
          title: "Catalog",
          url: "/products",
          icon: Package,
          isActive:
            pathname.startsWith("/products") ||
            pathname.startsWith("/categories") ||
            pathname.startsWith("/brands"),
          items: [
            { title: "Products", url: "/products" },
            { title: "Reviews", url: "/products/reviews" },
            { title: "Categories", url: "/categories" },
            { title: "Brands", url: "/brands" },
          ],
        },
        {
          title: "Blogs",
          url: "/blogs",
          icon: Newspaper,
          isActive: pathname.startsWith("/blogs"),
          items: [
            { title: "All Articles", url: "/blogs" },
            { title: "New Article", url: "/blogs/new" },
            { title: "Categories", url: "/blogs/categories" },
            { title: "Tags", url: "/blogs/tags" },
          ],
        },
        {
          title: "Orders",
          url: "/orders",
          icon: Package2,
          isActive: pathname.startsWith("/orders"),
        },
        {
          title: "Users",
          url: "/users",
          icon: Users,
          isActive: pathname.startsWith("/users"),
        },
      ],
    }),
    [user, pathname]
  );

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="bg-muted dark:bg-foreground/30">
                <div className="flex aspect-square size-full items-center justify-center rounded-lg">
                  <Image src="/logo.svg" alt="Logo" width={300} height={300} />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} groupLabel="Store" />
        <div className="text-muted-foreground mt-auto px-2 py-3 text-center font-mono text-[10px]">
          v{packageJson.version}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
