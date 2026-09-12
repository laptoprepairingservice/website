import { MapPin, Plus } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/shadcn/components/card";
import { Badge } from "@ui/shadcn/components/badge";
import { EmptyState } from "@ui/shadcn/components/empty-state";
import { getCurrentUserAddresses } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const addresses = await getCurrentUserAddresses();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Addresses</h1>
          <p className="mt-1 text-muted-foreground">Manage your delivery addresses</p>
        </div>
        <Button>
          <Plus className="size-4" />
          Add Address
        </Button>
      </div>

      {addresses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <CardTitle className="text-base">{address.label || "Delivery Address"}</CardTitle>
                  {address.is_default && <Badge variant="secondary">Default</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{address.full_name}</p>
                <p className="text-muted-foreground">{address.address_line1}</p>
                {address.address_line2 && (
                  <p className="text-muted-foreground">{address.address_line2}</p>
                )}
                <p className="text-muted-foreground">
                  {[address.city, address.state].filter(Boolean).join(", ")}
                  {address.postal_code ? ` — ${address.postal_code}` : ""}
                </p>
                {address.phone && <p className="text-muted-foreground">{address.phone}</p>}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  {!address.is_default && (
                    <Button variant="ghost" size="sm">
                      Set as Default
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12">
          <EmptyState
            icon={MapPin}
            title="No addresses saved"
            description="Add your delivery address to make checkout faster and seamless."
            action={
              <Button>
                <Plus className="size-4" />
                Add New Address
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
