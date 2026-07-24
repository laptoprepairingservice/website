"use client";

import {
  Breadcrumb as UiBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "ui/components/breadcrumb";
import { SidebarTrigger } from "ui/components/sidebar";
import Link from "next/link";
import { useBreadcrumb } from "./breadcrumb-provider";

export function Breadcrumb() {
  const { items } = useBreadcrumb();

  if (!items.length) {
    return null;
  }

  return (
    <UiBreadcrumb className="flex items-center gap-2">
      <SidebarTrigger />
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const key = `${item.href ?? "page"}-${item.label}-${index}`;

          return (
            <BreadcrumbItem key={key}>
              {isLast || !item.href ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </UiBreadcrumb>
  );
}
