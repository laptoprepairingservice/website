/**
 * Deprecated: Mock data has been decommissioned.
 * All store data (products, categories, brands) is now queried directly from Supabase.
 */

export const CATEGORIES = [];
export const BRANDS = [];
export const PRODUCTS = [];
export const POPULAR_SEARCHES = [];
export const RECENT_SEARCHES = [];

export function getProductBySlug() {
  return null;
}

export function getProductsByCategory() {
  return [];
}

export function getFeaturedProducts() {
  return [];
}

export function getRelatedProducts() {
  return [];
}
