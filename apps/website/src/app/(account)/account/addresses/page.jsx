"use client";

import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ADDRESSES = [
  {
    id: "1",
    label: "Home",
    name: "Rahul Shah",
    line1: "123, SG Highway, Near Iscon Cross Road",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380054",
    phone: "+91 98765 43210",
    isDefault: true,
  },
  {
    id: "2",
    label: "Office",
    name: "Rahul Shah",
    line1: "456, Prahlad Nagar, Ellisbridge",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380015",
    phone: "+91 98765 43210",
    isDefault: false,
  },
];

export default function AddressesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Addresses</h1>
          <p className="mt-1 text-muted-foreground">Manage your delivery addresses</p>
        </div>
        <Button>
          <Plus />
          Add Address
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ADDRESSES.map((address) => (
          <Card key={address.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">{address.label}</CardTitle>
                {address.isDefault && <Badge variant="secondary">Default</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{address.name}</p>
              <p className="text-muted-foreground">{address.line1}</p>
              <p className="text-muted-foreground">{address.city}, {address.state} — {address.pincode}</p>
              <p className="text-muted-foreground">{address.phone}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">Edit</Button>
                {!address.isDefault && (
                  <Button variant="ghost" size="sm">Set as Default</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
