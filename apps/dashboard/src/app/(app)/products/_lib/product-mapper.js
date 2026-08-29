import { getProductFormDefaults } from "./product-schema";

function emptyToNull(value) {
  if (value === "" || value === undefined) {
    return null;
  }
  return value;
}

export function toProductInsertPayload(values) {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    category_id: values.category_id,
    brand_id: values.brand_id ?? null,
    short_description: emptyToNull(values.short_description?.trim()),
    description: emptyToNull(values.description?.trim()),
    sku: emptyToNull(values.sku?.trim()),
    is_oem: values.is_oem,
    status: values.status,
    is_featured: values.is_featured,
    meta_title: emptyToNull(values.meta_title?.trim()),
    meta_description: emptyToNull(values.meta_description?.trim()),
  };
}

export function toVariantInsertPayload(productId, values) {
  const variant = values.default_variant;

  return {
    product_id: productId,
    sku: variant.sku.trim(),
    barcode: emptyToNull(variant.barcode?.trim()),
    variant_name: emptyToNull(variant.variant_name?.trim()),
    options: {},
    condition: variant.condition,
    price: variant.price,
    compare_at_price: variant.compare_at_price ?? null,
    cost_price: variant.cost_price ?? null,
    weight_grams: variant.weight_grams ?? null,
    is_default: true,
    is_active: variant.is_active,
    sort_order: 0,
  };
}

export function toProductUpdatePayload(values) {
  return toProductInsertPayload(values);
}

export function toVariantUpdatePayload(values) {
  const variant = values.default_variant;

  return {
    sku: variant.sku.trim(),
    barcode: emptyToNull(variant.barcode?.trim()),
    variant_name: emptyToNull(variant.variant_name?.trim()),
    condition: variant.condition,
    price: variant.price,
    compare_at_price: variant.compare_at_price ?? null,
    cost_price: variant.cost_price ?? null,
    weight_grams: variant.weight_grams ?? null,
    is_active: variant.is_active,
  };
}

export function toProductFormValues(product, defaultVariant) {
  return getProductFormDefaults({
    public_id: product.public_id,
    name: product.name ?? "",
    slug: product.slug ?? "",
    category_id: product.category_id ?? "",
    brand_id: product.brand_id ?? "",
    short_description: product.short_description ?? "",
    description: product.description ?? "",
    sku: product.sku ?? "",
    is_oem: product.is_oem ?? true,
    status: product.status ?? "draft",
    is_featured: product.is_featured ?? false,
    meta_title: product.meta_title ?? "",
    meta_description: product.meta_description ?? "",
    default_variant: {
      public_id: defaultVariant.public_id,
      sku: defaultVariant.sku ?? "",
      barcode: defaultVariant.barcode ?? "",
      variant_name: defaultVariant.variant_name ?? "",
      condition: defaultVariant.condition ?? "new",
      price: defaultVariant.price ?? "",
      compare_at_price: defaultVariant.compare_at_price ?? "",
      cost_price: defaultVariant.cost_price ?? "",
      weight_grams: defaultVariant.weight_grams ?? "",
      is_active: defaultVariant.is_active ?? true,
    },
  });
}
