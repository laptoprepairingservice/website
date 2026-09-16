"use client";

import { Icon } from "@iconify/react";
import { Input } from "ui/components/input";
import { cn } from "@/lib/utils";

export default function ListSearch({
  search,
  setSearch,
  fluid = false,
  searchPlaceholder = "Search…",
  clearFiltersOnSearch = false,
  clearFilters,
}) {
  return (
    <div className={cn("relative", fluid ? "w-full" : "w-80")}>
      <Icon
        icon={"mdi:search"}
        className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
      />
      <Input
        type="text"
        value={search}
        placeholder={searchPlaceholder}
        className="h-9 w-full pl-9 focus-visible:ring-0"
        onChange={(e) => {
          const value = e.target.value;

          setSearch(value);

          if (clearFiltersOnSearch && clearFilters) {
            clearFilters();
          }
        }}
      />
    </div>
  );
}
