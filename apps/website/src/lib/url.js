/**
 * Centralized URL routing helpers
 */

/**
 * Returns the canonical URL for a product: `/${brandSlug}/${categorySlug}/${productSlug}`
 */
export function getProductUrl(product) {
  if (!product) return "/";
  const brandSlug = product.brandSlug || product.brands?.slug;
  const categorySlug = product.category || product.categories?.slug;
  if (brandSlug && categorySlug && product.slug) {
    return `/${brandSlug}/${categorySlug}/${product.slug}`;
  }
  if (categorySlug && product.slug) {
    return `/${categorySlug}/${product.slug}`;
  }
  return `/${product.slug || ""}`;
}

/**
 * Returns the canonical URL for a brand page: `/${brandSlug}`
 */
export function getBrandUrl(brandSlug) {
  return brandSlug ? `/${brandSlug}` : "/";
}

/**
 * Returns the canonical URL for a brand + category page: `/${brandSlug}/${categorySlug}`
 */
export function getBrandCategoryUrl(brandSlug, categorySlug) {
  if (brandSlug && categorySlug) {
    return `/${brandSlug}/${categorySlug}`;
  }
  if (brandSlug) return `/${brandSlug}`;
  if (categorySlug) return `/${categorySlug}`;
  return "/";
}

/**
 * Returns the canonical URL for a category: `/${categorySlug}`
 */
export function getCategoryUrl(categorySlug) {
  return categorySlug ? `/${categorySlug}` : "/";
}
