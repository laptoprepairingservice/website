import { Badge } from "@ui/shadcn/components/badge";

/**
 * Consistent section header: icon chip + title + optional count badge + right-side action slot.
 */
export function SectionTitle({ icon: Icon, title, count, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-muted flex size-6 items-center justify-center rounded-md">
          <Icon className="text-muted-foreground size-3.5" />
        </div>
        <h2 className="text-foreground text-sm font-semibold">{title}</h2>
        {count != null && (
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        )}
      </div>
      {action}
    </div>
  );
}
