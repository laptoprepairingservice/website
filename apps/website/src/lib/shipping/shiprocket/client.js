import { getShiprocketToken } from "./auth";

const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external";

/**
 * Executes an authenticated request against Shiprocket REST API.
 * Automatically injects the Bearer authorization token.
 *
 * @param {string} endpoint - API path (e.g. '/courier/serviceability')
 * @param {RequestInit} [options={}] - Standard fetch options
 * @returns {Promise<any>}
 */
export async function shiprocketFetch(endpoint, options = {}) {
  const token = await getShiprocketToken();

  const url = endpoint.startsWith("http") ? endpoint : `${SHIPROCKET_API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedMessage = errorText;
    try {
      const json = JSON.parse(errorText);
      parsedMessage = json.message || json.errors || errorText;
    } catch {
      // Keep raw text
    }
    throw new Error(
      `Shiprocket API error (${response.status}): ${typeof parsedMessage === "object" ? JSON.stringify(parsedMessage) : parsedMessage}`
    );
  }

  return response.json();
}
