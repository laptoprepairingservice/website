import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  Shield,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { Card, CardContent } from "@ui/shadcn/components/card";
import { Separator } from "@ui/shadcn/components/separator";
import { formatPrice } from "@/lib/format";
import { formatDate, getRoleBadgeProps } from "../_lib/utils";
import { ProfileAvatar } from "./profile-avatar";
import { StatPill } from "./stat-pill";

export function UserProfileCard({ profile, orders }) {
  const fullName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Unnamed User";
  const { variant: roleBadgeVariant, className: roleBadgeClass } = getRoleBadgeProps(profile.role);

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);
  const deliveredCount = orders.filter((o) => o.status?.toLowerCase() === "delivered").length;
  const activeCount = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status?.toLowerCase())
  ).length;

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        {/* Avatar + identity */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <ProfileAvatar profile={profile} />

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex-1">
                <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                  {fullName}
                </h1>
                <p className="text-muted-foreground mt-0.5 font-mono text-xs">{profile.id}</p>
              </div>
              <Badge
                variant={roleBadgeVariant}
                className={`flex items-center gap-1.5 capitalize ${roleBadgeClass}`}
              >
                {profile.role === "admin" && <Shield className="size-3.5" />}
                {profile.role || "—"}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-sm">
              <Mail className="text-muted-foreground size-3.5" />
              <span className="text-foreground">{profile.email || "—"}</span>
            </div>

            <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3" />
                Joined {formatDate(profile.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                Updated {formatDate(profile.updated_at)}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-5" />

        {/* Stats strip */}
        <div className="flex gap-3">
          <StatPill
            icon={ShoppingBag}
            label="Total Orders"
            value={orders.length}
            colorClass="text-primary bg-primary/10"
          />
          <StatPill
            icon={CreditCard}
            label="Total Spent"
            value={formatPrice(totalSpent)}
            colorClass="text-emerald-600 bg-emerald-500/10"
          />
          <StatPill
            icon={CheckCircle2}
            label="Delivered"
            value={deliveredCount}
            colorClass="text-blue-600 bg-blue-500/10"
          />
          {activeCount > 0 && (
            <StatPill
              icon={Truck}
              label="Active"
              value={activeCount}
              colorClass="text-amber-600 bg-amber-500/10"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
