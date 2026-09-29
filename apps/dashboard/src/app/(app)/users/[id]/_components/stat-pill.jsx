/**
 * A centred stat pill used inside the profile card stats strip.
 * @param {React.ElementType} icon  - Lucide icon component
 * @param {string} label            - Label below the value
 * @param {string|number} value     - Primary displayed value
 * @param {string} colorClass       - Tailwind classes for icon bg + text colour
 */
export function StatPill({ icon: Icon, label, value, colorClass = "text-primary bg-primary/10" }) {
  return (
    <div className="border-border bg-card flex flex-1 flex-col items-center gap-1 rounded-xl border p-4 text-center">
      <div className={`flex size-9 items-center justify-center rounded-full ${colorClass}`}>
        <Icon className="size-4" />
      </div>
      <p className="text-foreground text-xl font-bold tabular-nums">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}
