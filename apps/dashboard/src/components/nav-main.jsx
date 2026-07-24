"use client";

import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "ui/components/collapsible";
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
} from "ui/components/sidebar";
import { Badge } from "ui/components/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * NavMainWithBadge Component
 *
 * A sidebar navigation component that supports:
 * - Main navigation items with icons
 * - Sub navigation items
 * - Sub navigation items with badges or counts
 *
 * @param {Object} props
 * @param {Array} props.items - Array of navigation items
 * @param {string} props.groupLabel - Label for the navigation group (default: "Platform")
 * @param {string} props.className - Additional CSS classes
 */
export function NavMain({
  items,
  groupLabel = "Platform",
  className,
  ...props
}) {
  return (
    <SidebarGroup className={className} {...props}>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.badge && (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  )}
                  {item.count !== undefined && item.count !== null && (
                    <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
                  )}
                </Link>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                              {(subItem.badge ||
                                (subItem.count !== undefined &&
                                  subItem.count !== null)) && (
                                <div className="ml-auto flex items-center gap-1">
                                  {subItem.badge && (
                                    <Badge
                                      variant={
                                        subItem.badgeVariant || "default"
                                      }
                                      className={cn(
                                        "h-5 min-w-5 px-1.5 text-xs",
                                        subItem.badgeClassName,
                                      )}
                                    >
                                      {subItem.badge}
                                    </Badge>
                                  )}
                                  {subItem.count !== undefined &&
                                    subItem.count !== null && (
                                      <Badge
                                        variant={
                                          subItem.countVariant || "secondary"
                                        }
                                        className={cn(
                                          "h-5 min-w-5 px-1.5 text-xs",
                                          subItem.countClassName,
                                        )}
                                      >
                                        {subItem.count}
                                      </Badge>
                                    )}
                                </div>
                              )}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
