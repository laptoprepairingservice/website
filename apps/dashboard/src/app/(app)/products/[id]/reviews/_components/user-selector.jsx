"use client";

import { useMemo, useState } from "react";
import { Check, Mail, Search, Shield, User, UserCheck, UserPlus, X } from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { Input } from "@ui/shadcn/components/input";
import { Label } from "@ui/shadcn/components/label";
import { cn } from "@/lib/utils";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserSelector({
  users = [],
  selectedUserId,
  onSelectUser,
  reviewerName,
  reviewerEmail,
  onChangeReviewerName,
  onChangeReviewerEmail,
  errors = {},
}) {
  const [mode, setMode] = useState(() => (selectedUserId ? "registered" : "registered"));
  const [search, setSearch] = useState("");
  const [isChangingUser, setIsChangingUser] = useState(false);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find((u) => String(u.id) === String(selectedUserId)) || null;
  }, [users, selectedUserId]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handlePickUser = (user) => {
    onSelectUser(user.id);
    onChangeReviewerName(user.name);
    onChangeReviewerEmail(user.email);
    setIsChangingUser(false);
    setSearch("");
  };

  const handleClearSelectedUser = () => {
    onSelectUser(null);
    setIsChangingUser(true);
  };

  const handleSwitchToManual = () => {
    setMode("manual");
    onSelectUser(null);
    setIsChangingUser(false);
  };

  const handleSwitchToRegistered = () => {
    setMode("registered");
    if (!selectedUserId) {
      setIsChangingUser(true);
    }
  };

  return (
    <div className="space-y-3.5 rounded-xl border border-border/70 bg-muted/20 p-4">
      {/* Mode Selection Tabs */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <User className="size-3.5 text-primary" />
          Assign Review To Customer <span className="text-destructive">*</span>
        </Label>
        <div className="inline-flex rounded-lg border border-border/80 bg-background/80 p-0.5 text-xs">
          <button
            type="button"
            onClick={handleSwitchToRegistered}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer",
              mode === "registered"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserCheck className="size-3" />
            <span>Registered User</span>
          </button>
          <button
            type="button"
            onClick={handleSwitchToManual}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer",
              mode === "manual"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserPlus className="size-3" />
            <span>Custom / Guest</span>
          </button>
        </div>
      </div>

      {mode === "registered" ? (
        <div className="space-y-2.5">
          {/* Active Selected User Card */}
          {selectedUser && !isChangingUser ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase">
                  {getInitials(selectedUser.name)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground truncate max-w-[200px]">
                      {selectedUser.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                      {selectedUser.role === "admin" && <Shield className="mr-0.5 size-2.5" />}
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground flex items-center gap-1 truncate text-[11px]">
                    <Mail className="size-3 shrink-0" />
                    {selectedUser.email || "No email on file"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingUser(true)}
                  className="h-7 text-xs px-2.5 cursor-pointer"
                >
                  Change User
                </Button>
                <button
                  type="button"
                  onClick={handleClearSelectedUser}
                  className="text-muted-foreground hover:text-destructive p-1 rounded-md cursor-pointer"
                  title="Remove user"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Searchable User Selector Dropdown / Box */
            <div className="space-y-2 rounded-lg border border-border bg-background p-3">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2 size-3.5" />
                <Input
                  type="text"
                  placeholder="Search customer by name, email, or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs w-full"
                  autoFocus={isChangingUser}
                />
              </div>

              <div className="max-h-48 overflow-y-auto divide-y divide-border/50 rounded-md border border-border/60">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isSelected = String(user.id) === String(selectedUserId);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handlePickUser(user)}
                        className={cn(
                          "w-full flex items-center justify-between p-2 text-left text-xs transition-colors hover:bg-muted/60 cursor-pointer",
                          isSelected && "bg-primary/10 text-primary font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground truncate">{user.name}</span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                ({user.role})
                              </span>
                            </div>
                            <span className="text-muted-foreground text-[11px] truncate block">
                              {user.email}
                            </span>
                          </div>
                        </div>

                        {isSelected && <Check className="size-4 text-primary shrink-0 ml-2" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No customers found matching &quot;{search}&quot;. You can switch to Custom/Guest tab to enter manually.
                  </div>
                )}
              </div>

              {selectedUser && (
                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChangingUser(false)}
                    className="h-6 text-xs text-muted-foreground"
                  >
                    Keep current ({selectedUser.name})
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Customer Details Display / Override Inputs */}
          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            <div className="space-y-1">
              <Label htmlFor="reviewer_name" className="text-[11px] font-semibold text-muted-foreground">
                Display Name on Review <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reviewer_name"
                value={reviewerName || ""}
                onChange={(e) => onChangeReviewerName(e.target.value)}
                placeholder="e.g. John Doe"
                className="h-8 text-xs bg-background"
              />
              {errors.reviewer_name && (
                <p className="text-destructive text-[11px] mt-0.5">{errors.reviewer_name}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="reviewer_email" className="text-[11px] font-semibold text-muted-foreground">
                Email Address <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="reviewer_email"
                type="email"
                value={reviewerEmail || ""}
                onChange={(e) => onChangeReviewerEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="h-8 text-xs bg-background"
              />
              {errors.reviewer_email && (
                <p className="text-destructive text-[11px] mt-0.5">{errors.reviewer_email}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Manual Guest Entry Mode */
        <div className="space-y-3 pt-1">
          <p className="text-muted-foreground text-[11px]">
            Enter review author details manually without linking to a registered user account.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="manual_reviewer_name" className="text-[11px] font-semibold">
                Customer Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="manual_reviewer_name"
                value={reviewerName || ""}
                onChange={(e) => onChangeReviewerName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="h-8 text-xs bg-background"
              />
              {errors.reviewer_name && (
                <p className="text-destructive text-[11px] mt-0.5">{errors.reviewer_name}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="manual_reviewer_email" className="text-[11px] font-semibold">
                Customer Email <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="manual_reviewer_email"
                type="email"
                value={reviewerEmail || ""}
                onChange={(e) => onChangeReviewerEmail(e.target.value)}
                placeholder="e.g. priya.sharma@gmail.com"
                className="h-8 text-xs bg-background"
              />
              {errors.reviewer_email && (
                <p className="text-destructive text-[11px] mt-0.5">{errors.reviewer_email}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
