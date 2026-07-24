import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Pagination({ currentPage = 1, totalPages = 1, baseHref = "?", className }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon-sm"
        disabled={currentPage <= 1}
        aria-label="Previous page"
        asChild={currentPage > 1}
      >
        {currentPage > 1 ? (
          <Link href={`${baseHref}page=${currentPage - 1}`}>
            <ChevronLeft />
          </Link>
        ) : (
          <ChevronLeft />
        )}
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <Link
            key={page}
            href={`${baseHref}page=${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
              page === currentPage
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {page}
          </Link>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon-sm"
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={`${baseHref}page=${currentPage + 1}`}>
            <ChevronRight />
          </Link>
        ) : (
          <ChevronRight />
        )}
      </Button>
    </nav>
  );
}
