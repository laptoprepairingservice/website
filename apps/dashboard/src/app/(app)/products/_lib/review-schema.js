import { z } from "zod";

export const REVIEW_STATUSES = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

export const productReviewSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  public_id: z.string().optional(),
  product_id: z.union([z.number(), z.string()]).refine((val) => Boolean(val), {
    message: "Product is required",
  }),
  user_id: z.string().nullable().optional(),
  reviewer_name: z
    .string()
    .trim()
    .min(1, "Customer / Reviewer name is required")
    .max(100, "Name cannot exceed 100 characters"),
  reviewer_email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  rating: z.coerce
    .number({ invalid_type_error: "Rating must be a number" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  title: z
    .string()
    .trim()
    .max(150, "Review headline cannot exceed 150 characters")
    .optional()
    .or(z.literal("")),
  comment: z
    .string()
    .trim()
    .min(3, "Review description must be at least 3 characters")
    .max(3000, "Review description cannot exceed 3000 characters"),
  is_verified_purchase: z.boolean().default(true),
  status: z.enum(["approved", "pending", "rejected"]).default("approved"),
  created_at: z.string().optional(),
});

export function getReviewFormDefaults(overrides = {}) {
  return {
    product_id: "",
    user_id: null,
    reviewer_name: "",
    reviewer_email: "",
    rating: 5,
    title: "",
    comment: "",
    is_verified_purchase: true,
    status: "approved",
    created_at: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm for datetime-local
    ...overrides,
  };
}
