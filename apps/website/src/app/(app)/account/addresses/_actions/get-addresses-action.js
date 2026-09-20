"use server";

import { getCurrentUserAddresses } from "@/lib/orders";

/**
 * Server action wrapper around getCurrentUserAddresses.
 * Allows client components to fetch addresses without importing server-only modules.
 */
export async function getAddressesAction() {
  return getCurrentUserAddresses();
}
