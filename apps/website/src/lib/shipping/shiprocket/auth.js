const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Retrieves a valid Shiprocket Bearer authentication token.
 * Tokens are cached in-memory and renewed automatically before expiration.
 *
 * @returns {Promise<string>}
 */
export async function getShiprocketToken() {
  const now = Date.now();

  // Reuse token if still valid (with 1-hour safety margin)
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Shiprocket credentials not configured. Please set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in environment variables."
    );
  }

  const response = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shiprocket authentication failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (!data?.token) {
    throw new Error("Shiprocket authentication response did not contain a valid token.");
  }

  cachedToken = data.token;
  // Shiprocket tokens are valid for multiple days; cache for 23 hours to ensure freshness
  tokenExpiresAt = now + 23 * 60 * 60 * 1000;

  return cachedToken;
}
