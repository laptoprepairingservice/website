/**
 * Dashed-border empty state for a section that has no data.
 * @param {React.ElementType} icon - Lucide icon
 * @param {string} message         - Short descriptive message
 */
export function EmptySection({ icon: Icon, message }) {
  return (
    <div className="border-border flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-center">
      <Icon className="text-muted-foreground/40 size-8" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
