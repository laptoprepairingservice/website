import { getProductFormDefaults } from "./product-schema";
import { getProductAssetUrl } from "@/lib/supabase/storage";

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
  if (!product) {
    return getProductFormDefaults();
  }

  const rawImages = Array.isArray(product.product_images) ? product.product_images : [];
  const assets = rawImages.map((img) => ({
    id: img.id,
    public_id: img.public_id,
    storage_path: img.storage_path,
    alt_text: img.alt_text ?? "",
    width: img.width ?? null,
    height: img.height ?? null,
    sort_order: img.sort_order ?? 0,
    is_banner: Boolean(img.is_banner),
    media_type: img.media_type || "image",
    file_name: img.file_name || "",
    file_size: img.file_size ?? null,
    mime_type: img.mime_type || "",
    url: getProductAssetUrl(img.storage_path),
  }));

  const variant = defaultVariant || {};

  return getProductFormDefaults({
    id: product.id,
    public_id: product.public_id || "",
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
      public_id: variant.public_id || "",
      sku: variant.sku ?? "",
      barcode: variant.barcode ?? "",
      variant_name: variant.variant_name ?? "",
      condition: variant.condition ?? "new",
      price: variant.price ?? "",
      compare_at_price: variant.compare_at_price ?? "",
      cost_price: variant.cost_price ?? "",
      weight_grams: variant.weight_grams ?? "",
      is_active: variant.is_active ?? true,
    },
    assets,
  });
}
