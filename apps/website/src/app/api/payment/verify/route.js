import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * POST /api/payment/verify
 *
 * Verifies Razorpay HMAC signature, then creates the DB order.
 * Body: {
 *   razorpay_order_id, razorpay_payment_id, razorpay_signature,
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    if (!RAZORPAY_KEY_SECRET) {
      console.error("RAZORPAY_KEY_SECRET is not set");
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    // ── Verify HMAC signature ─────────────────────────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Razorpay signature mismatch");
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
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
        payment_method: "razorpay",
        payment_id: razorpay_payment_id,
        payment_status: "paid",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Failed to create order in DB:", orderError);
      return NextResponse.json(
        {
          error: "Payment received but order creation failed. Contact support.",
          payment_id: razorpay_payment_id,
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
