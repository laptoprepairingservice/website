"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Lock,
  Check,
  Pencil,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/shadcn/components/card";
import { FormField } from "@ui/shadcn/components/form-field";
import { Input } from "@ui/shadcn/components/input";
import { Badge } from "@ui/shadcn/components/badge";
import { useAppContext } from "@/app/_context";
import { updateProfileAction } from "./_components/update-profile-action";

function UserAvatar({ firstName, lastName, email }) {
  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`
      : firstName
        ? firstName[0]
        : email?.[0]?.toUpperCase() || "U";

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground sm:h-20 sm:w-20 sm:text-2xl">
      {initials.toUpperCase()}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, placeholder = "Not set" }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/60 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground truncate">
          {value || (
            <span className="text-muted-foreground/60 italic text-xs">{placeholder}</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, refreshUser } = useAppContext();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const firstName = user?.first_name || "";
  const lastName = user?.last_name || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "—";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    setError("");

    const result = await updateProfileAction(new FormData(e.currentTarget));
    setPending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    await refreshUser();
    toast.success("Profile updated successfully");
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      {/* Profile overview */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar
                firstName={firstName}
                lastName={lastName}
                email={user?.email}
              />
              <div className="min-w-0">
                <p className="text-lg font-semibold leading-tight">{fullName}</p>
                <p className="mt-0.5 text-sm text-muted-foreground truncate">
                  {user?.email || "—"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {user?.email && (
                    <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                      <ShieldCheck className="size-3 text-emerald-500" />
                      Verified
                    </Badge>
                  )}
                  {user?.phone && (
                    <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                      <Phone className="size-3" />
                      {user.phone}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 sm:w-auto"
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-3.5" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit form or detail view */}
      {editing ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Edit Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              key={`${user?.first_name}-${user?.last_name}-${user?.phone}`}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="First Name" id="firstName">
                  <Input
                    id="firstName"
                    name="first_name"
                    defaultValue={user?.first_name || ""}
                    placeholder="First name"
                  />
                </FormField>
                <FormField label="Last Name" id="lastName">
                  <Input
                    id="lastName"
                    name="last_name"
                    defaultValue={user?.last_name || ""}
                    placeholder="Last name"
                  />
                </FormField>
              </div>

              <FormField label="Email" id="email">
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user?.email || ""}
                    readOnly
                    className="cursor-not-allowed bg-muted/40 pr-10 text-muted-foreground"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </FormField>

              <FormField label="Phone Number" id="phone">
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={user?.phone || ""}
                  placeholder="+91 98765 43210"
                />
              </FormField>

              {error && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(false);
                    setError("");
                  }}
                  disabled={pending}
                  className="gap-1.5"
                >
                  <X className="size-3.5" />
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={pending} className="gap-1.5">
                  {pending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check className="size-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow icon={User} label="Full Name" value={fullName} />
            <InfoRow icon={Mail} label="Email Address" value={user?.email} />
            <InfoRow
              icon={Phone}
              label="Phone Number"
              value={user?.phone}
              placeholder="Not set — add a phone number"
            />
          </CardContent>
        </Card>
      )}

      {/* Security */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Lock className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground">
                  Keep your account secure
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
