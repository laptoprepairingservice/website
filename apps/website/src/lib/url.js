/**
 * Centralized URL routing helpers
 */

/**
 * Returns the canonical URL for a product: `/${categorySlug}/${productSlug}`
 */
export function getProductUrl(product) {
  if (!product) return "/";
  const categorySlug = product.category || product.categories?.slug;
  if (categorySlug && product.slug) {
    return `/${categorySlug}/${product.slug}`;
  }
  return `/${product.slug || ""}`;
}

/**
 * Returns the canonical URL for a category: `/${categorySlug}`
 */
export function getCategoryUrl(categorySlug) {
  return categorySlug ? `/${categorySlug}` : "/";
}
