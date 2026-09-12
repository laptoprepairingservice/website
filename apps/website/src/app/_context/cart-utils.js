export const LOCAL_CART_KEY = "ranuja_cart";

export function getGuestCart() {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveGuestCart(items) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn("Failed to save guest cart:", error);
  }
}

export function clearGuestCart() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_CART_KEY);
  }
}

export function getVariantId(product, explicitVariantId = null) {
  return (
    explicitVariantId ??
    product?.variantId ??
    product?.defaultVariantId ??
    product?.variants?.[0]?.id ??
    product?.id
  );
}

export function createCartItem(product, quantity = 1, variantId = null) {
  if (!product) return null;

  const resolvedVariantId = getVariantId(product, variantId);

  return {
    variantId: resolvedVariantId,
    productId: product.id ?? product.productId ?? null,
    name: product.name ?? "Hardware Product",
    slug: product.slug ?? "",
    brand: product.brand ?? "Hardware",
    price: Number(product.price) || 0,
    originalPrice:
      product.originalPrice != null
        ? Number(product.originalPrice)
        : null,
    quantity: Math.max(1, Number(quantity) || 1),
    image: product.image ?? product.bannerImage ?? "",
  };
}

export function updateLocalCart(items, newItem) {
  const index = items.findIndex(
    (item) => String(item.variantId) === String(newItem.variantId)
  );

  if (index === -1) {
    return [...items, newItem];
  }

  return items.map((item, i) =>
    i === index
      ? {
          ...item,
          quantity: Math.min(999, (item.quantity || 0) + (newItem.quantity || 1)),
        }
      : item
  );
}

export function computeCartCount(items = []) {
  if (!Array.isArray(items)) return 0;
  return items.reduce(
    (total, item) => total + Number(item?.quantity || 0),
    0
  );
}

export function computeCartSubtotal(items = []) {
  if (!Array.isArray(items)) return 0;
  return items.reduce(
    (total, item) =>
      total + Number(item?.price || 0) * Number(item?.quantity || 0),
    0
  );
}
