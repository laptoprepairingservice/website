import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * POST /api/payment/create-order
 *
 * Creates a Razorpay order server-side (secret key never exposed to client).
 * Body: { amount_paise: number, receipt?: string }
 * Returns: { order_id, amount, currency, key }
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

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local");
      return NextResponse.json(
        { error: "Payment gateway not configured. Contact support." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { amount_paise, receipt } = body;

    if (!amount_paise || amount_paise < 100) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: amount_paise, // in paise
        currency: "INR",
        receipt: receipt || `rcpt_${Date.now()}`,
      }),
    });

    if (!rzpResponse.ok) {
      const err = await rzpResponse.json();
      console.error("Razorpay create order error:", err);
      return NextResponse.json(
        { error: "Failed to create payment order. Try again." },
        { status: 502 }
      );
    }

    const order = await rzpResponse.json();

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: RAZORPAY_KEY_ID, // public key — safe to expose
    });
  } catch (err) {
    console.error("Error in /api/payment/create-order:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
