import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWishlistProducts } from "@/lib/wishlist";

/**
 * Fetches all orders for the currently authenticated user.
 */
export async function getCurrentUserOrders() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        subtotal,
        shipping_amount,
        discount_amount,
        tax_amount,
        total_amount,
        shipping_address,
        customer_note,
        created_at,
        order_items (
          id,
          variant_id,
          product_name,
          sku,
          unit_price,
          quantity,
          subtotal
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to query user orders:", error);
      return [];
    }

    return orders || [];
  } catch (err) {
    console.error("Error in getCurrentUserOrders:", err);
    return [];
  }
}

/**
 * Fetches an order by its ID or order_number.
 */
export async function getOrderById(idOrNumber) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    let query = supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        subtotal,
        shipping_amount,
        discount_amount,
        tax_amount,
        total_amount,
        shipping_address,
        customer_note,
        created_at,
        order_items (
          id,
          variant_id,
          product_name,
          sku,
          unit_price,
          quantity,
          subtotal
        )
      `)
      .eq("user_id", user.id);

    if (String(idOrNumber).includes("-")) {
      query = query.eq("order_number", idOrNumber);
    } else {
      query = query.eq("id", idOrNumber);
    }

    const { data: order, error } = await query.maybeSingle();

    if (error) {
      console.error("Failed to fetch order:", error);
      return null;
    }

    return order;
  } catch (err) {
    console.error("Error in getOrderById:", err);
    return null;
  }
}

/**
 * Fetches all saved addresses for the currently authenticated user.
 */
export async function getCurrentUserAddresses() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: addresses, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to query addresses:", error);
      return [];
    }

    return addresses || [];
  } catch (err) {
    console.error("Error in getCurrentUserAddresses:", err);
    return [];
  }
}

/**
 * Fetches dashboard summary data (orders and wishlist) for the account page.
 */
export async function getAccountDashboardData() {
  try {
    const [orders, wishlistProducts] = await Promise.all([
      getCurrentUserOrders(),
      getCurrentUserWishlistProducts(),
    ]);

    return {
      ordersCount: orders.length,
      recentOrders: orders.slice(0, 3),
      wishlistCount: wishlistProducts.length,
      wishlistProducts: wishlistProducts.slice(0, 2),
    };
  } catch (err) {
    console.error("Error in getAccountDashboardData:", err);
    return {
      ordersCount: 0,
      recentOrders: [],
      wishlistCount: 0,
      wishlistProducts: [],
    };
  }
}
