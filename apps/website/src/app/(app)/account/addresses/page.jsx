import { getCurrentUserAddresses } from "@/lib/orders";
import { AddressManager } from "./_components/address-manager";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const addresses = await getCurrentUserAddresses();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Addresses</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your saved delivery addresses
        </p>
      </div>

      <AddressManager initialAddresses={addresses} />
    </div>
  );
}
