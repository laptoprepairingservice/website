import { createClient } from "@/lib/supabase/server";

/**
 * Fetches profile, orders, and addresses for a user in a single parallel call.
 * @param {string} userId - Supabase auth user UUID
 */
export async function fetchUserData(userId) {
  const supabase = await createClient();

  const [profileRes, ordersRes, addressesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, first_name, last_name, email, role, avatar_url, created_at, updated_at")
      .eq("id", userId)
      .single(),

    supabase
      .from("orders")
      .select(
        "id, order_number, status, payment_status, total_amount, created_at, order_items(id, product_name, quantity)"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),

    supabase
      .from("addresses")
      .select(
        "id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default"
      )
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  return {
    profile: profileRes.data,
    profileError: profileRes.error,
    orders: ordersRes.data ?? [],
    addresses: addressesRes.data ?? [],
  };
}
