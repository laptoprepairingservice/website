import { Check, Package, Truck, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Package, color: "text-muted-foreground" },
  confirmed: { label: "Confirmed", icon: Check, color: "text-primary" },
  packed: { label: "Packed", icon: Package, color: "text-primary" },
  shipped: { label: "Shipped", icon: Truck, color: "text-primary" },
  out_for_delivery: { label: "Out for Delivery", icon: Truck, color: "text-primary" },
  delivered: { label: "Delivered", icon: Check, color: "text-success" },
  cancelled: { label: "Cancelled", icon: X, color: "text-destructive" },
};

export function OrderTimeline({ currentStatus = "shipped", className }) {
  const steps = ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];
  const currentIndex = steps.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled";

  if (isCancelled) {
    const config = STATUS_CONFIG.cancelled;
    const Icon = config.icon;
    return (
      <div className={cn("flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4", className)}>
        <Icon className="size-5 text-destructive" />
        <span className="font-medium text-destructive">Order Cancelled</span>
      </div>
    );
  }

  return (
    <ol className={cn("relative space-y-0", className)}>
      {steps.map((step, index) => {
        const config = STATUS_CONFIG[step];
        const Icon = config.icon;
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-5 top-10 h-full w-0.5 -translate-x-1/2",
                  isComplete && index < currentIndex ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <div
              className={cn(
                "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                isComplete ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground",
                isCurrent && "ring-4 ring-primary/20"
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="pt-1.5">
              <p className={cn("text-sm font-medium", isComplete ? "text-foreground" : "text-muted-foreground")}>
                {config.label}
              </p>
              {isCurrent && <p className="mt-0.5 text-xs text-muted-foreground">Current status</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
