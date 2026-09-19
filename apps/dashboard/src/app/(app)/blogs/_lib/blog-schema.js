import { z } from "zod";

export const BLOG_STATUSES = [
  { value: "draft", label: "Draft", variant: "secondary" },
  { value: "published", label: "Published", variant: "success" },
  { value: "archived", label: "Archived", variant: "destructive" },
];

export function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateReadingTime(htmlContent = "") {
  if (!htmlContent) return 1;
  // Strip HTML tags to count words
  const cleanText = htmlContent.replace(/<[^>]*>/g, " ").trim();
  const words = cleanText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const blogCategorySchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Category slug is required"),
  description: z.string().optional().nullable(),
});

export const blogTagSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Tag name is required"),
  slug: z.string().min(1, "Tag slug is required"),
});

export const faqItemSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

export const blogPostFormSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  published_at: z.string().optional().nullable(),
  author_id: z.string().uuid("Invalid author ID").optional().nullable(),
  featured_image_url: z.string().optional().nullable(),
  featured_image_alt: z.string().optional().nullable(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  canonical_url: z.string().optional().nullable(),
  reading_time_minutes: z.coerce.number().min(1).default(1),
  is_featured: z.boolean().default(false),
  category_ids: z.array(z.coerce.number()).default([]),
  tag_ids: z.array(z.coerce.number()).default([]),
  product_ids: z.array(z.coerce.number()).default([]),
  related_post_ids: z.array(z.coerce.number()).default([]),
  // FAQ items (stored in blog_post_faqs table)
  faqs: z.array(faqItemSchema).default([]),
  // Custom Schema.org JSON-LD override (stored in blog_posts.schema_org_jsonld)
  schema_org_jsonld: z.string().optional().nullable(),
});

export function getBlogPostFormDefaults(initialData = null) {
  return {
    id: initialData?.id ?? undefined,
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: initialData?.excerpt ?? "",
    content: initialData?.content ?? "",
    status: initialData?.status ?? "draft",
    published_at: initialData?.published_at ? new Date(initialData.published_at).toISOString().slice(0, 16) : "",
    author_id: initialData?.author_id ?? "",
    featured_image_url: initialData?.featured_image_url ?? "",
    featured_image_alt: initialData?.featured_image_alt ?? "",
    meta_title: initialData?.meta_title ?? "",
    meta_description: initialData?.meta_description ?? "",
    canonical_url: initialData?.canonical_url ?? "",
    reading_time_minutes: initialData?.reading_time_minutes ?? 1,
    is_featured: Boolean(initialData?.is_featured),
    category_ids: initialData?.category_ids ?? [],
    tag_ids: initialData?.tag_ids ?? [],
    product_ids: initialData?.product_ids ?? [],
    related_post_ids: initialData?.related_post_ids ?? [],
    faqs: initialData?.faqs ?? [],
    schema_org_jsonld: initialData?.schema_org_jsonld
      ? (typeof initialData.schema_org_jsonld === "string"
          ? initialData.schema_org_jsonld
          : JSON.stringify(initialData.schema_org_jsonld, null, 2))
      : "",
  };
}
