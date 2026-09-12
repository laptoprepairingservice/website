/**
 * Helper utilities for client-side wishlist calculations and checks.
 * Mirrors cart-utils.js pattern.
 */

export function computeWishlistCount(items = []) {
  if (!Array.isArray(items)) return 0;
  return items.length;
}

export function isProductInWishlist(items = [], productId) {
  if (!Array.isArray(items) || !productId) return false;
  const targetId = String(productId);
  return items.some(
    (item) =>
      String(item.productId) === targetId ||
      String(item.id) === targetId ||
      String(item.product?.id) === targetId
  );
}

export function createWishlistItem(product) {
  if (!product) return null;
  return {
    id: `temp-${product.id}`,
    productId: product.id,
    product,
    ...product,
  };
}
