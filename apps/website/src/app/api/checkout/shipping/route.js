import { calculateCartWeight } from "@/lib/shipping/calculate-cart-weight";
import { checkShiprocketServiceability } from "@/lib/shipping/shiprocket/serviceability";
import { NextResponse } from "next/server";

/**
 * POST /api/checkout/shipping
 *
 * Checks delivery availability and calculates real-time shipping rates with Shiprocket.
 * Computes authoritative package weight server-side from cart items.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { deliveryPostcode, cartItems = [], cartSubtotal = 0, cod = false } = body;

    const pincode = String(deliveryPostcode || "").trim();

    if (!pincode) {
      return NextResponse.json(
        {
          success: false,
          serviceable: false,
          message: "Delivery postal code (PIN code) is required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          serviceable: false,
          message: "Please enter a valid 6-digit Indian PIN code.",
        },
        { status: 400 }
      );
    }

    // Authoritative weight calculated server-side from catalog variants
    const packageWeightKg = await calculateCartWeight(cartItems);

    const result = await checkShiprocketServiceability({
      deliveryPostcode: pincode,
      weight: packageWeightKg,
      cod: Boolean(cod),
      declaredValue: Number(cartSubtotal) || 0,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Shipping serviceability endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        serviceable: false,
        message: "Unable to verify delivery serviceability at this time. Please try again.",
      },
      { status: 500 }
    );
  }
}
