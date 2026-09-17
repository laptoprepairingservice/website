/**
 * Maps a raw Supabase blog_posts row (with joined relations) to a clean JS object.
 *
 * @param {object|null} raw - The raw Supabase row
 * @returns {object|null}
 */
export function mapSupabaseBlogPost(raw) {
  if (!raw) return null;

  // Flatten categories from junction table
  const categories = (raw.blog_post_categories || [])
    .map((jt) => jt.blog_categories)
    .filter(Boolean)
    .map((c) => ({ id: c.id, name: c.name, slug: c.slug }));

  // Flatten tags from junction table
  const tags = (raw.blog_post_tags || [])
    .map((jt) => jt.blog_tags)
    .filter(Boolean)
    .map((t) => ({ id: t.id, name: t.name, slug: t.slug }));

  // Author from profiles join
  const author = raw.profiles
    ? {
        id: raw.profiles.id,
        name:
          [raw.profiles.first_name, raw.profiles.last_name]
            .filter(Boolean)
            .join(" ") || "Author",
        avatarUrl: raw.profiles.avatar_url || null,
      }
    : null;

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    excerpt: raw.excerpt || null,
    content: raw.content || null,
    status: raw.status,
    publishedAt: raw.published_at || null,
    featuredImage: raw.featured_image_url || null,
    featuredImageAlt: raw.featured_image_alt || raw.title || "",
    metaTitle: raw.meta_title || raw.title,
    metaDescription: raw.meta_description || raw.excerpt || null,
    canonicalUrl: raw.canonical_url || null,
    readingTime: raw.reading_time_minutes || null,
    isFeatured: raw.is_featured || false,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at || null,
    author,
    categories,
    tags,
    // Convenience: primary category (first one)
    primaryCategory: categories[0] || null,
  };
}
