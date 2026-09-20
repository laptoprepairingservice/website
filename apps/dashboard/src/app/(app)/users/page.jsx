"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  List as ListIcon,
  Mail,
  Shield,
  User,
  UserCircle,
} from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { Label } from "@ui/shadcn/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/shadcn/components/select";

import List from "@/components/react-list";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(firstName, lastName) {
  const f = firstName?.trim()?.[0]?.toUpperCase() ?? "";
  const l = lastName?.trim()?.[0]?.toUpperCase() ?? "";
  return f + l || "?";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getRoleBadgeProps(role) {
  switch (role?.toLowerCase()) {
    case "admin":
      return { variant: "outline", className: "border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold" };
    case "customer":
      return { variant: "outline", className: "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold" };
    default:
      return { variant: "secondary", className: "font-semibold" };
  }
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function UserAvatar({ profile, size = "md" }) {
  const initials = getInitials(profile.first_name, profile.last_name);
  const sizeClass = size === "sm" ? "size-9 text-xs" : "size-12 text-sm";
  const colors = [
    "bg-violet-500/20 text-violet-700 dark:text-violet-300",
    "bg-blue-500/20 text-blue-700 dark:text-blue-300",
    "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    "bg-rose-500/20 text-rose-700 dark:text-rose-300",
  ];
  // Pick color deterministically based on first char of email
  const colorClass = colors[(profile.email?.charCodeAt(0) ?? 0) % colors.length];

  if (profile.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt={`${profile.first_name} ${profile.last_name}`}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-border`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${colorClass} flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-border`}
    >
      {initials}
    </div>
  );
}

// ─── Filter Renderer ──────────────────────────────────────────────────────────

function renderFilters({ filters, setFilters }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Role</Label>
        <Select
          value={filters?.role ?? ""}
          onValueChange={(val) =>
            setFilters({ ...filters, role: val === "all" ? undefined : val })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'

  const tableColumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
          const user = row.original;
          const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "—";
          return (
            <div className="flex items-center gap-3 py-1">
              <UserAvatar profile={user} size="sm" />
              <div className="flex min-w-0 flex-col">
                <Link
                  href={`/users/${user.id}`}
                  className="text-foreground hover:text-primary truncate font-medium transition"
                >
                  {fullName}
                </Link>
                <span className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                  <Mail className="size-3 shrink-0" />
                  {user.email || "—"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const { variant, className } = getRoleBadgeProps(row.original.role);
          return (
            <Badge variant={variant} className={`capitalize ${className}`}>
              {row.original.role === "admin" && <Shield className="mr-1 size-3" />}
              {row.original.role || "—"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 cursor-pointer px-2.5 text-xs font-medium"
            >
              <Link href={`/users/${row.original.id}`}>
                <UserCircle className="mr-1 size-3.5" />
                View
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <List
        title="Users"
        endpoint="profiles"
        select="id, first_name, last_name, email, role, avatar_url, created_at, updated_at"
        meta={{ search: "first_name,last_name,email" }}
        searchPlaceholder="Search users by name or email..."
        sortBy="created_at"
        sortOrder="desc"
        columns={viewMode === "table" ? tableColumns : []}
        renderFilters={renderFilters}
        href={(item) => `/users/${item.id}`}
        addItemSlot={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="border-border bg-muted/40 text-muted-foreground inline-flex items-center rounded-lg border p-2">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "cards"
                    ? "bg-background text-foreground shadow-xs"
                    : "hover:text-foreground"
                }`}
                title="Card View"
              >
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-xs"
                    : "hover:text-foreground"
                }`}
                title="Table View"
              >
                <ListIcon className="size-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        }
      >
        {({ items }) => {
          if (items.length === 0) return null;

          return (
            <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((user) => {
                const fullName =
                  [user.first_name, user.last_name].filter(Boolean).join(" ") || "Unnamed User";
                const { variant, className: badgeClass } = getRoleBadgeProps(user.role);

                return (
                  <Link
                    key={user.id}
                    href={`/users/${user.id}`}
                    className="group border-border bg-card/60 hover:bg-card hover:border-primary/40 relative flex flex-col gap-4 rounded-xl border p-4 transition-all duration-200 hover:shadow-md"
                  >
                    {/* Top row: Avatar + role badge */}
                    <div className="flex items-start justify-between gap-3">
                      <UserAvatar profile={user} size="md" />
                      <Badge
                        variant={variant}
                        className={`mt-0.5 flex shrink-0 items-center gap-1 capitalize ${badgeClass}`}
                      >
                        {user.role === "admin" && <Shield className="size-3" />}
                        {user.role || "—"}
                      </Badge>
                    </div>

                    {/* Name & email */}
                    <div className="min-w-0 space-y-0.5">
                      <h3 className="text-foreground group-hover:text-primary truncate font-semibold transition-colors">
                        {fullName}
                      </h3>
                      <p className="text-muted-foreground flex items-center gap-1.5 truncate text-sm">
                        <Mail className="size-3.5 shrink-0" />
                        {user.email || "—"}
                      </p>
                    </div>

                    {/* Footer: joined date */}
                    <div className="border-border/50 flex items-center justify-between border-t pt-3">
                      <span className="text-muted-foreground text-xs">
                        Joined {formatDate(user.created_at)}
                      </span>
                      <span className="text-primary group-hover:underline text-xs font-medium">
                        View profile →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        }}
      </List>
    </div>
  );
}
