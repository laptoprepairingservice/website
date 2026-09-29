import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { formatPrice } from "@/lib/format";
import { formatDate, getOrderStatus } from "../_lib/utils";
import { SectionTitle } from "./section-title";
import { EmptySection } from "./empty-section";

function ActivityDot({ cfg }) {
  const bgClass = cfg.color.replace("text-", "bg-");
  return (
    <div className={`absolute top-1 -left-[26px] flex size-5 items-center justify-center rounded-full ${cfg.bg}`}>
      <div className={`size-2 rounded-full ${bgClass}`} />
    </div>
  );
}

function ActivityEvent({ event }) {
  const cfg = getOrderStatus(event.status);
  return (
    <div className="relative">
      <ActivityDot cfg={cfg} />
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Link
            href={`/orders/${event.id}`}
            className="text-foreground hover:text-primary text-sm font-medium transition"
          >
            {event.label}
          </Link>
          <Badge variant={cfg.variant} className="text-[10px] capitalize">
            {cfg.label}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs">{event.description}</p>
        <p className="text-muted-foreground/60 text-[10px]">
          {formatDate(event.date, { month: "short" })}
        </p>
      </div>
    </div>
  );
}

/**
 * @param {Array} orders - raw orders array; derives activity events from orders
 */
export function UserActivityFeed({ orders }) {
  const events = orders.slice(0, 8).map((o) => ({
    id: o.id,
    date: o.created_at,
    label: o.order_number || `#${o.id}`,
    description: `${o.order_items?.length ?? 0} item${o.order_items?.length === 1 ? "" : "s"} · ${formatPrice(o.total_amount)}`,
    status: o.status,
  }));

  return (
    <div>
      <SectionTitle icon={Clock} title="Recent Activity" />

      {events.length === 0 ? (
        <EmptySection icon={Clock} message="No recent activity." />
      ) : (
        <div className="relative">
          {/* dashed vertical line */}
          <div className="border-border absolute left-3.5 top-2 h-[calc(100%-16px)] w-px border-l border-dashed" />
          <div className="space-y-4 pl-10">
            {events.map((event) => (
              <ActivityEvent key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
