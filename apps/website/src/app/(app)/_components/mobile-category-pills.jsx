import Link from "next/link";
import { Folder } from "lucide-react";

export function MobileCategoryPills({ categories = [] }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-border bg-background py-2.5 lg:hidden">
      <div className="container">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <Link
              key={cat.id || cat.slug}
              href={`/${cat.slug}`}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Folder className="size-3.5 text-muted-foreground" />
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
