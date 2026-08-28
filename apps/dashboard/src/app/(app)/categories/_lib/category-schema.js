import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  parent_id: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? null : value),
    z.coerce.number().int().positive().nullable().optional()
  ),
  description: z.string().trim().optional(),
  image_path: z.string().trim().optional(),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
  meta_title: z.string().trim().optional(),
  meta_description: z.string().trim().optional(),
});

export const updateCategoryFormSchema = categoryFormSchema.extend({
  id: z.coerce.number().int().positive(),
});

export function getCategoryFormDefaults(overrides = {}) {
  return {
    name: "",
    slug: "",
    parent_id: "",
    description: "",
    image_path: "",
    sort_order: 0,
    is_active: true,
    meta_title: "",
    meta_description: "",
    ...overrides,
  };
}

export function toCategoryFormValues(category) {
  return getCategoryFormDefaults({
    id: category.id,
    name: category.name ?? "",
    slug: category.slug ?? "",
    parent_id: category.parent_id ?? "",
    description: category.description ?? "",
    image_path: category.image_path ?? "",
    sort_order: category.sort_order ?? 0,
    is_active: category.is_active ?? true,
    meta_title: category.meta_title ?? "",
    meta_description: category.meta_description ?? "",
  });
}
