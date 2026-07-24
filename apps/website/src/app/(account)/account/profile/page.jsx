"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, Input } from "@/components/ui/input";

export default function ProfilePage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Profile updated");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your personal information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid max-w-lg gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First Name" id="firstName">
                <Input id="firstName" defaultValue="Rahul" />
              </FormField>
              <FormField label="Last Name" id="lastName">
                <Input id="lastName" defaultValue="Shah" />
              </FormField>
            </div>
            <FormField label="Email" id="email">
              <Input id="email" type="email" defaultValue="rahul@example.com" />
            </FormField>
            <FormField label="Phone" id="phone">
              <Input id="phone" type="tel" defaultValue="+91 98765 43210" />
            </FormField>
            <Button type="submit" className="w-fit">Save Changes</Button>
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
