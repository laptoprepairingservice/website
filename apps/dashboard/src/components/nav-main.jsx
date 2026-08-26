"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@ui/shadcn/components/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ui/shadcn/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@ui/shadcn/components/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({ items, groupLabel = "Store", className, ...props }) {
  const pathname = usePathname();

  return (
    <SidebarGroup className={className} {...props}>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = Boolean(item.items?.length);
          const isActive =
            item.isActive ||
            pathname === item.url ||
            (item.url !== "/" && pathname.startsWith(item.url));

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction className="data-[state=open]:rotate-90">
                    <ChevronRight />
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const subActive =
                        pathname === subItem.url || pathname.startsWith(`${subItem.url}/`);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={subActive}>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                              {(subItem.badge || subItem.count != null) && (
                                <div className="ml-auto flex items-center gap-1">
                                  {subItem.badge && (
                                    <Badge
                                      variant={subItem.badgeVariant || "default"}
                                      className={cn("h-5 min-w-5 px-1.5 text-xs", subItem.badgeClassName)}
                                    >
                                      {subItem.badge}
                                    </Badge>
                                  )}
                                  {subItem.count != null && (
                                    <Badge
                                      variant={subItem.countVariant || "secondary"}
                                      className={cn("h-5 min-w-5 px-1.5 text-xs", subItem.countClassName)}
                                    >
                                      {subItem.count}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
