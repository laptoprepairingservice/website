import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ClipboardList,
  History,
  Mail,
  MapPin,
  Shield,
  UserCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(firstName, lastName) {
  const f = firstName?.trim()?.[0]?.toUpperCase() ?? "";
  const l = lastName?.trim()?.[0]?.toUpperCase() ?? "";
  return f + l || "?";
}

function formatDate(dateStr, opts = {}) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "long",
      day: "numeric",
      year: "numeric",
      ...opts,
    });
  } catch {
    return dateStr;
  }
}

function getRoleBadgeProps(role) {
  switch (role?.toLowerCase()) {
    case "admin":
      return {
        variant: "outline",
        className:
          "border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-sm px-3 py-1",
      };
    case "customer":
      return {
        variant: "outline",
        className:
          "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-sm px-3 py-1",
      };
    default:
      return { variant: "secondary", className: "font-semibold text-sm px-3 py-1" };
  }
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function ProfileAvatar({ profile }) {
  const initials = getInitials(profile.first_name, profile.last_name);
  const colors = [
    "bg-violet-500/20 text-violet-700 dark:text-violet-300",
    "bg-blue-500/20 text-blue-700 dark:text-blue-300",
    "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    "bg-rose-500/20 text-rose-700 dark:text-rose-300",
  ];
  const colorClass = colors[(profile.email?.charCodeAt(0) ?? 0) % colors.length];

  if (profile.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt={`${profile.first_name} ${profile.last_name}`}
        className="ring-border size-24 shrink-0 rounded-full object-cover ring-4"
      />
    );
  }

  return (
    <div
      className={`size-24 ${colorClass} ring-border flex shrink-0 items-center justify-center rounded-full text-3xl font-bold ring-4`}
    >
      {initials}
    </div>
  );
}

// ─── Future Scope Placeholder ─────────────────────────────────────────────────

function ComingSoonSection({ icon: Icon, title, description }) {
  return (
    <div className="border-border bg-muted/20 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
      <div className="bg-muted flex size-12 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground size-6" />
      </div>
      <div>
        <p className="text-foreground font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      <Badge variant="secondary" className="text-xs">
        Coming soon
      </Badge>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function UserDetailPage({ params }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, role, avatar_url, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const fullName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Unnamed User";
  const { variant: roleBadgeVariant, className: roleBadgeClass } = getRoleBadgeProps(profile.role);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ml-2 gap-1.5">
          <Link href="/users">
            <ArrowLeft className="size-4" />
            All Users
          </Link>
        </Button>
      </div>

      {/* Profile card */}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        {/* Header row */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <ProfileAvatar profile={profile} />

          <div className="flex-1 space-y-3">
            {/* Name + role */}
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex-1">
                <h1 className="text-foreground text-2xl font-bold tracking-tight">{fullName}</h1>
                <p className="text-muted-foreground mt-0.5 font-mono text-sm">{profile.id}</p>
              </div>
              <Badge
                variant={roleBadgeVariant}
                className={`flex items-center gap-1.5 capitalize ${roleBadgeClass}`}
              >
                {profile.role === "admin" && <Shield className="size-3.5" />}
                {profile.role || "—"}
              </Badge>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2">
              <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
                <Mail className="text-muted-foreground size-4" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="text-foreground text-sm font-medium">{profile.email || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-border my-5 border-t" />

        {/* Metadata grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
              <CalendarDays className="text-muted-foreground size-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Member since</p>
              <p className="text-foreground text-sm font-medium">
                {formatDate(profile.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
              <Clock className="text-muted-foreground size-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Last updated</p>
              <p className="text-foreground text-sm font-medium">
                {formatDate(profile.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Future scope sections ────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-foreground text-lg font-semibold">More Details</h2>
          <Badge variant="outline" className="text-muted-foreground text-xs">
            Future scope
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <ComingSoonSection
            icon={MapPin}
            title="Addresses"
            description="Saved delivery and billing addresses will appear here."
          />
          <ComingSoonSection
            icon={ClipboardList}
            title="Orders"
            description="Order history and purchase details will appear here."
          />
          <ComingSoonSection
            icon={History}
            title="Activity"
            description="User activity and event history will appear here."
          />
        </div>
      </div>
    </div>
  );
}
