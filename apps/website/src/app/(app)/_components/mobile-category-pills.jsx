import Link from "next/link";
import { Cpu, Flame, HardDrive, Layers, Monitor, Sparkles, Zap } from "lucide-react";

const CATEGORIES = [
  { name: "CPUs", href: "/products?category=processors", icon: Cpu },
  { name: "GPUs", href: "/products?category=graphics-cards", icon: Zap },
  { name: "Motherboards", href: "/products?category=motherboards", icon: Layers },
  { name: "RAM", href: "/products?category=memory", icon: Sparkles },
  { name: "Storage", href: "/products?category=storage", icon: HardDrive },
  { name: "Monitors", href: "/products?category=monitors", icon: Monitor },
  { name: "Deals", href: "/products?sort=popular", icon: Flame },
];

export function MobileCategoryPills() {
  return (
    <div className="border-b border-border bg-background py-2.5 lg:hidden">
      <div className="container">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                href={cat.href}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Icon className="size-3.5 text-muted-foreground" />
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
