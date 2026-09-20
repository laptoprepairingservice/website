"use client";

import { useState } from "react";
import { getAddressesAction } from "../_actions/get-addresses-action";
import { AddressList } from "@/components/address/address-list";

export function AddressManager({ initialAddresses = [] }) {
  const [addresses, setAddresses] = useState(initialAddresses);

  const handleMutated = async () => {
    const updated = await getAddressesAction();
    setAddresses(updated);
  };

  return (
    <AddressList
      addresses={addresses}
      selectable={false}
      showActions={true}
      onMutated={handleMutated}
    />
  );
}
