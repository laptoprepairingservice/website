import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumb({ items = [], className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}>
      <Link href="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
        <Home className="size-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      {items.map((item, index) => (
        <span key={item.href || item.label} className="flex items-center gap-1">
          <ChevronRight className="size-3.5" aria-hidden />
          {item.href && index < items.length - 1 ? (
            <Link href={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
