"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@ui/shadcn/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/shadcn/components/card";
import { FormField } from "@ui/shadcn/components/form-field";
import { Input } from "@ui/shadcn/components/input";
import { useAppContext } from "@/app/_context";
import { LogoutButton } from "@/components/auth/logout-button";
import { updateProfileAction } from "./_components/update-profile-action";

export default function ProfilePage() {
  const { user, refreshUser } = useAppContext();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

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
    toast.success("Profile updated");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Profile</h1>
          <p className="mt-1 text-muted-foreground">Manage your personal information</p>
        </div>
        <LogoutButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            key={`${user?.first_name}-${user?.last_name}-${user?.phone}`}
            onSubmit={handleSubmit}
            className="grid max-w-lg gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First Name" id="firstName">
                <Input id="firstName" name="first_name" defaultValue={user?.first_name || ""} />
              </FormField>
              <FormField label="Last Name" id="lastName">
                <Input id="lastName" name="last_name" defaultValue={user?.last_name || ""} />
              </FormField>
            </div>
            <FormField label="Email" id="email">
              <Input id="email" name="email" type="email" defaultValue={user?.email || ""} readOnly />
            </FormField>
            <FormField label="Phone" id="phone">
              <Input id="phone" name="phone" type="tel" defaultValue={user?.phone || ""} />
            </FormField>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-fit" disabled={pending}>
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid max-w-lg gap-4">
            <FormField label="Current Password" id="currentPassword">
              <Input id="currentPassword" type="password" />
            </FormField>
            <FormField label="New Password" id="newPassword">
              <Input id="newPassword" type="password" />
            </FormField>
            <FormField label="Confirm Password" id="confirmPassword">
              <Input id="confirmPassword" type="password" />
            </FormField>
            <Button type="submit" variant="outline" className="w-fit">Update Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
