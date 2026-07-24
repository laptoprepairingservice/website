"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, Input, Textarea } from "@/components/ui/input";
import { STORE } from "@/lib/store-config";

export default function AdminSettingsPage() {
  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Settings saved");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure store information and general settings
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="grid max-w-2xl gap-4">
            <FormField label="Store Name" id="storeName">
              <Input id="storeName" defaultValue={STORE.name} />
            </FormField>
            <FormField label="Tagline" id="tagline">
              <Input id="tagline" defaultValue={STORE.tagline} />
            </FormField>
            <FormField label="Address" id="address">
              <Textarea id="address" defaultValue={STORE.address} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Phone" id="phone">
                <Input id="phone" defaultValue={STORE.phone} />
              </FormField>
              <FormField label="Email" id="email">
                <Input id="email" type="email" defaultValue={STORE.email} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Charges</CardTitle>
          </CardHeader>
          <CardContent className="grid max-w-2xl gap-4 sm:grid-cols-2">
            <FormField label="Standard Shipping (₹)" id="standardShipping">
              <Input id="standardShipping" type="number" defaultValue={STORE.standardShipping} />
            </FormField>
            <FormField label="Free Shipping Threshold (₹)" id="freeShipping">
              <Input id="freeShipping" type="number" defaultValue={STORE.freeShippingThreshold} />
            </FormField>
            <FormField label="COD Fee (₹)" id="codFee">
              <Input id="codFee" type="number" defaultValue={STORE.codFee} />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GST Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid max-w-2xl gap-4 sm:grid-cols-2">
            <FormField label="GSTIN" id="gstin">
              <Input id="gstin" defaultValue={STORE.gstin} />
            </FormField>
            <FormField label="Default GST Rate (%)" id="gstRate">
              <Input id="gstRate" type="number" defaultValue="18" />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid max-w-2xl gap-4">
            <FormField label="SMTP Host" id="smtpHost">
              <Input id="smtpHost" placeholder="smtp.example.com" />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="SMTP Port" id="smtpPort">
                <Input id="smtpPort" placeholder="587" />
              </FormField>
              <FormField label="From Email" id="fromEmail">
                <Input id="fromEmail" defaultValue="noreply@Ranuja.in" />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid max-w-2xl gap-4">
            <FormField label="Meta Title" id="metaTitle">
              <Input id="metaTitle" defaultValue="Ranuja — Premium Computer Hardware | Ahmedabad" />
            </FormField>
            <FormField label="Meta Description" id="metaDescription">
              <Textarea
                id="metaDescription"
                defaultValue="Premium computer hardware store in Ahmedabad, India. Genuine processors, graphics cards, and components."
                rows={3}
              />
            </FormField>
          </CardContent>
        </Card>

        <Button type="submit" size="lg">
          Save All Settings
        </Button>
      </form>
    </div>
  );
}
