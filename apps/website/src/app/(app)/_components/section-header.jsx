import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  badge,
  title,
  description,
  href,
  linkText = "View All",
  align = "between",
  children,
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:flex-row sm:items-end",
        align === "center" ? "items-center text-center sm:justify-center" : "justify-between"
      )}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-xl"}>
        {badge && (
          <span className="mb-2 inline-block rounded border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {badge}
          </span>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {children}
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            {linkText}
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
