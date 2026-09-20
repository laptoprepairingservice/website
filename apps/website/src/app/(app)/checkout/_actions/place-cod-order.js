"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Creates a Cash on Delivery order in the database.
 * Called from checkout page when payment method is COD.
 */
export async function placeCODOrderAction({
  address,
  cartItems = [],
  subtotal = 0,
  shipping = 0,
  codFee = 0,
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const totalAmount = subtotal + shipping + codFee;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        subtotal,
        shipping_amount: shipping,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: totalAmount,
        shipping_address: address
          ? {
              full_name: address.full_name,
              phone: address.phone,
              address_line1: address.address_line1,
              address_line2: address.address_line2 || null,
              landmark: address.landmark || null,
              city: address.city,
              state: address.state,
              postal_code: address.postal_code,
              country: address.country || "India",
            }
          : null,
        payment_method: "cod",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Failed to create COD order:", orderError);
      return { error: "Failed to place order. Please try again." };
    }

    // Insert order items
    if (cartItems.length > 0) {
      const { error: itemsError } = await supabase.from("order_items").insert(
        cartItems.map((item) => ({
          order_id: order.id,
          variant_id: item.variantId || null,
          product_name: item.name,
          sku: item.sku || null,
          unit_price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        }))
      );

      if (itemsError) {
        console.error("Failed to insert order items:", itemsError);
        // Non-fatal — order already created
      }
    }

    return { success: true, order_id: order.id, order_number: order.order_number };
  } catch (err) {
    console.error("Error in placeCODOrderAction:", err);
    return { error: "Something went wrong. Please try again." };
  }
}
