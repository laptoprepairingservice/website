import { getCurrentUserAddresses } from "@/lib/orders";
import { AddressManager } from "./_components/address-manager";
import { MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const addresses = await getCurrentUserAddresses();
  const count = addresses.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Addresses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {count > 0
            ? `${count} saved ${count === 1 ? "address" : "addresses"}`
            : "Add your first delivery address to speed up checkout"}
        </p>
      </div>

      <AddressManager initialAddresses={addresses} />
    </div>
  );
}
