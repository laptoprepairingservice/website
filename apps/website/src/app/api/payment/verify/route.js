import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_BASE_URL = process.env.CASHFREE_ENV === "production"
  ? "https://api.cashfree.com/pg"
  : "https://sandbox.cashfree.com/pg";

/**
 * POST /api/payment/verify
 *
 * Fetches the Cashfree order status server-side to verify the payment,
 * then creates the DB order record.
 *
 * Body: {
 *   cf_order_id: string,
 *   orderPayload: { address, cartItems, shipping, subtotal }
 * }
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { cf_order_id, orderPayload } = body;

    if (!cf_order_id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    // ── Verify payment status with Cashfree ───────────────────────────────────
    const cfRes = await fetch(`${CASHFREE_BASE_URL}/orders/${cf_order_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
      },
    });

    if (!cfRes.ok) {
      const err = await cfRes.json();
      console.error("Cashfree order fetch error:", err);
      return NextResponse.json(
        { error: "Could not verify payment. Contact support." },
        { status: 502 }
      );
    }

    const cfOrder = await cfRes.json();

    // Cashfree order statuses: PAID, ACTIVE, EXPIRED, CANCELLED
    if (cfOrder.order_status !== "PAID") {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${cfOrder.order_status}` },
        { status: 400 }
      );
    }

    // ── Create order in database ──────────────────────────────────────────────
    const { address, cartItems = [], shipping = 0, subtotal = 0 } = orderPayload || {};
    const totalAmount = subtotal + shipping;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "confirmed",
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
        payment_method: "cashfree",
        payment_id: cfOrder.cf_order_id || cf_order_id,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Failed to create order in DB:", orderError);
      return NextResponse.json(
        {
          error: "Payment received but order creation failed. Contact support with your payment ID.",
          cf_order_id,
        },
        { status: 500 }
      );
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

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
    });
  } catch (err) {
    console.error("Error in /api/payment/verify:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
