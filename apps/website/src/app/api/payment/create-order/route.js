import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
// Switch to https://api.cashfree.com/pg for production
const CASHFREE_BASE_URL = process.env.CASHFREE_ENV === "production"
  ? "https://api.cashfree.com/pg"
  : "https://sandbox.cashfree.com/pg";

/**
 * POST /api/payment/create-order
 *
 * Creates a Cashfree order server-side (secret key never exposed to client).
 * Body: {
 *   amount: number (INR),
 *   customer: { id, name, email, phone }
 * }
 * Returns: { payment_session_id, order_id }
 */
export async function POST(request) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      console.error(
        "Cashfree credentials not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env"
      );
      return NextResponse.json(
        { error: "Payment gateway not configured. Contact support." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { amount, customer } = body;

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const orderId = `order_${Date.now()}_${user.id.slice(0, 8)}`;

    const cfResponse = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: Number(amount).toFixed(2),
        order_currency: "INR",
        customer_details: {
          customer_id: customer?.id || user.id,
          customer_name: customer?.name || "",
          customer_email: customer?.email || user.email || "",
          customer_phone: customer?.phone || "9999999999",
        },
        order_meta: {
          notify_url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/payment/webhook`,
        },
      }),
    });

    if (!cfResponse.ok) {
      const err = await cfResponse.json();
      console.error("Cashfree create order error:", err);
      return NextResponse.json(
        { error: err?.message || "Failed to create payment order. Try again." },
        { status: 502 }
      );
    }

    const order = await cfResponse.json();

    return NextResponse.json({
      payment_session_id: order.payment_session_id,
      order_id: order.order_id,
    });
  } catch (err) {
    console.error("Error in /api/payment/create-order:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
