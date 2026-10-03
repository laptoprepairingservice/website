"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { cn } from "@/lib/utils";

export function ProductFormHeader({
  isEdit,
  initialName,
  productIdentifier,
  watchStatus,
  isDirty,
  isSubmitting,
}) {
  const statusBadgeVariant =
    watchStatus === "active"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
      : watchStatus === "draft"
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
      : "bg-muted text-muted-foreground border-border";

  return (
    <div className="bg-background/95 border-border/80 sticky top-0 z-20 -mx-4 flex flex-col gap-3 border-b px-4 py-3.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-foreground truncate text-xl font-bold tracking-tight sm:text-2xl">
              {isEdit ? initialName || "Edit product" : "New product"}
            </h1>
            <Badge variant="outline" className={cn("capitalize font-semibold", statusBadgeVariant)}>
              {watchStatus || "draft"}
            </Badge>
            {isDirty && (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            {isEdit
              ? "Update product catalog details, media assets, pricing, and SEO."
              : "Fill in product specifications, inventory attributes, and publish to storefront."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEdit && productIdentifier && (
            <Button type="button" variant="outline" size="sm" asChild className="cursor-pointer">
              <Link href={`/products/${productIdentifier}/reviews`}>
                <MessageSquare className="size-3.5 mr-1 text-amber-500" />
                Customer Reviews
              </Link>
            </Button>
          )}

          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/products">Cancel</Link>
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold cursor-pointer">
            {isSubmitting ? (
              <>
                <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                Saving...
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create product"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
