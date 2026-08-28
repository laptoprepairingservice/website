import { z } from "zod";

export const brandFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  logo_path: z.string().trim().optional(),
  website_url: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
      message: "Enter a valid URL starting with http:// or https://",
    }),
  description: z.string().trim().optional(),
  is_active: z.boolean().default(true),
});

export const updateBrandFormSchema = brandFormSchema.extend({
  id: z.coerce.number().int().positive(),
});

export function getBrandFormDefaults(overrides = {}) {
  return {
    name: "",
    slug: "",
    logo_path: "",
    website_url: "",
    description: "",
    is_active: true,
    ...overrides,
  };
}

export function toBrandFormValues(brand) {
  return getBrandFormDefaults({
    id: brand.id,
    name: brand.name ?? "",
    slug: brand.slug ?? "",
    logo_path: brand.logo_path ?? "",
    website_url: brand.website_url ?? "",
    description: brand.description ?? "",
    is_active: brand.is_active ?? true,
  });
}
