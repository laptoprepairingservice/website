import { z } from "zod";

export const PRODUCT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export const VARIANT_CONDITIONS = [
  { value: "new", label: "New" },
  { value: "refurbished", label: "Refurbished" },
  { value: "used", label: "Used" },
];

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().nullable().optional()
);

const optionalPositiveInt = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().int().min(0).nullable().optional()
);

export const defaultVariantSchema = z.object({
  sku: z.string().trim().min(1, "Variant SKU is required"),
  barcode: z.string().trim().optional(),
  variant_name: z.string().trim().optional(),
  condition: z.enum(["new", "refurbished", "used"]).default("new"),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  compare_at_price: optionalNumber,
  cost_price: optionalNumber,
  weight_grams: optionalPositiveInt,
  is_active: z.boolean().default(true),
});

export const productAssetSchema = z.object({
  id: z.coerce.number().optional(),
  public_id: z.string().optional(),
  storage_path: z.string().min(1, "Storage path is required"),
  alt_text: z.string().trim().nullable().optional(),
  width: optionalPositiveInt,
  height: optionalPositiveInt,
  sort_order: z.coerce.number().default(0),
  is_banner: z.boolean().default(false),
  media_type: z.enum(["image", "video"]).default("image"),
  file_name: z.string().nullable().optional(),
  file_size: optionalPositiveInt,
  mime_type: z.string().nullable().optional(),
  url: z.string().optional(),
});

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, "Product name is required"),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
    category_id: z.coerce.number().int().positive("Category is required"),
    brand_id: z.preprocess(
      (value) => (value === "" || value === null || value === undefined ? null : value),
      z.coerce.number().int().positive().nullable().optional()
    ),
    short_description: z.string().trim().optional(),
    description: z.string().trim().optional(),
    sku: z.string().trim().optional(),
    is_oem: z.boolean().default(true),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    is_featured: z.boolean().default(false),
    meta_title: z.string().trim().optional(),
    meta_description: z.string().trim().optional(),
    default_variant: defaultVariantSchema,
    assets: z.array(productAssetSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const { compare_at_price, price } = data.default_variant;

    if (compare_at_price != null && compare_at_price < price) {
      ctx.addIssue({
        code: "custom",
        message: "Compare-at price must be greater than or equal to price",
        path: ["default_variant", "compare_at_price"],
      });
    }

    if (data.default_variant.cost_price != null && data.default_variant.cost_price < 0) {
      ctx.addIssue({
        code: "custom",
        message: "Cost price must be 0 or greater",
        path: ["default_variant", "cost_price"],
      });
    }
  });

export const updateProductFormSchema = productFormSchema.safeExtend({
  public_id: z.string().uuid("Invalid product identifier"),

  default_variant: defaultVariantSchema.extend({
    public_id: z.string().uuid("Invalid variant identifier"),
  }),
});

export function getProductFormDefaults(overrides = {}) {
  return {
    name: "",
    slug: "",
    category_id: "",
    brand_id: "",
    short_description: "",
    description: "",
    sku: "",
    is_oem: true,
    status: "draft",
    is_featured: false,
    meta_title: "",
    meta_description: "",
    default_variant: {
      sku: "",
      barcode: "",
      variant_name: "",
      condition: "new",
      price: "",
      compare_at_price: "",
      cost_price: "",
      weight_grams: "",
      is_active: true,
    },
    assets: [],
    ...overrides,
  };
}
