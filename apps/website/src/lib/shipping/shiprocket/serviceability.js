import { shiprocketFetch } from "./client";

/**
 * Checks courier serviceability and shipping rates with Shiprocket.
 * Normalizes the response into a clean, framework-independent format.
 *
 * @param {object} params
 * @param {string} params.deliveryPostcode - 6-digit destination postal code
 * @param {number} [params.weight=0.5] - Package weight in kilograms (minimum 0.5kg)
 * @param {boolean} [params.cod=false] - Whether Cash On Delivery serviceability is needed
 * @param {number} [params.declaredValue] - Declared package value in INR for insurance/valuation
 * @returns {Promise<{
 *   serviceable: boolean,
 *   deliveryPostcode: string,
 *   pickupPostcode: string,
 *   weightKg: number,
 *   shippingOptions: Array<{
 *     courierId: number,
 *     courierName: string,
 *     rate: number,
 *     estimatedDelivery: string,
 *     etdDays: number|null,
 *     codAvailable: boolean,
 *     isSurface: boolean,
 *     rating: number
 *   }>,
 *   cheapestOption: object|null,
 *   fastestOption: object|null,
 *   standardRate: number,
 *   expressRate: number,
 *   reason?: string
 * }>}
 */
export async function checkShiprocketServiceability({
  deliveryPostcode,
  weight = 0.5,
  cod = false,
  declaredValue = 0,
}) {
  const pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE || "380015";

  const cleanDelivery = String(deliveryPostcode || "").trim();

  if (!cleanDelivery || !/^\d{6}$/.test(cleanDelivery)) {
    return {
      serviceable: false,
      deliveryPostcode: cleanDelivery,
      pickupPostcode,
      weightKg: weight,
      shippingOptions: [],
      cheapestOption: null,
      fastestOption: null,
      standardRate: 0,
      expressRate: 0,
      reason: "Please enter a valid 6-digit Indian PIN code.",
    };
  }

  // Ensure weight is positive and at least 0.5kg for standard logistics
  const safeWeight = Math.max(0.5, Number(weight) || 0.5);

  const queryParams = new URLSearchParams({
    pickup_postcode: pickupPostcode,
    delivery_postcode: cleanDelivery,
    weight: safeWeight.toFixed(2),
    cod: cod ? "1" : "0",
  });

  if (declaredValue && Number(declaredValue) > 0) {
    queryParams.set("declared_value", String(Math.round(declaredValue)));
  }

  try {
    const response = await shiprocketFetch(
      `/courier/serviceability/?${queryParams.toString()}`,
      { method: "GET" }
    );

    const availableCouriers =
      response?.data?.available_courier_companies || [];

    if (!Array.isArray(availableCouriers) || availableCouriers.length === 0) {
      return {
        serviceable: false,
        deliveryPostcode: cleanDelivery,
        pickupPostcode,
        weightKg: safeWeight,
        shippingOptions: [],
        cheapestOption: null,
        fastestOption: null,
        standardRate: 0,
        expressRate: 0,
        reason: "Delivery is currently unavailable to this pincode with our courier partners.",
      };
    }

    // Map and normalize courier records
    const shippingOptions = availableCouriers.map((c) => {
      const rawRate = Number(c.rate) || Number(c.freight_charge) || 0;
      const etdDays = parseInt(c.estimated_delivery_days, 10);

      return {
        courierId: c.courier_company_id,
        courierName: c.courier_name,
        rate: Math.round(rawRate),
        estimatedDelivery: c.etd || "",
        etdDays: Number.isFinite(etdDays) ? etdDays : null,
        codAvailable: Boolean(c.cod === 1),
        isSurface: Boolean(c.is_surface),
        rating: Number(c.delivery_performance || c.rating || 0),
      };
    });

    // Sort by rate ascending to find the cheapest option
    const sortedByPrice = [...shippingOptions].sort((a, b) => a.rate - b.rate);
    const cheapestOption = sortedByPrice[0] || null;

    // Find fastest air delivery option
    const sortedBySpeed = [...shippingOptions]
      .filter((s) => s.etdDays != null)
      .sort((a, b) => a.etdDays - b.etdDays);
    const fastestOption = sortedBySpeed[0] || cheapestOption;

    const standardRate = cheapestOption ? cheapestOption.rate : 79;
    const expressRate = fastestOption
      ? Math.max(fastestOption.rate, standardRate + 50)
      : standardRate + 80;

    return {
      serviceable: true,
      deliveryPostcode: cleanDelivery,
      pickupPostcode,
      weightKg: safeWeight,
      shippingOptions,
      cheapestOption,
      fastestOption,
      standardRate,
      expressRate,
    };
  } catch (error) {
    console.error("Shiprocket serviceability query failed:", error);

    // Fallback gracefully so a transient Shiprocket network outage does not freeze customer checkout
    return {
      serviceable: true,
      deliveryPostcode: cleanDelivery,
      pickupPostcode,
      weightKg: safeWeight,
      shippingOptions: [
        {
          courierId: 1,
          courierName: "Standard Express Courier",
          rate: 79,
          estimatedDelivery: "3–5 business days",
          etdDays: 4,
          codAvailable: true,
          isSurface: true,
          rating: 4.5,
        },
      ],
      cheapestOption: {
        courierId: 1,
        courierName: "Standard Express Courier",
        rate: 79,
        estimatedDelivery: "3–5 business days",
        etdDays: 4,
      },
      fastestOption: {
        courierId: 1,
        courierName: "Standard Express Courier",
        rate: 149,
        estimatedDelivery: "1–2 business days",
        etdDays: 2,
      },
      standardRate: 79,
      expressRate: 149,
      isFallback: true,
    };
  }
}
