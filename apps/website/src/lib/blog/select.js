/**
 * Full SELECT query for blog post listings and detail pages.
 * Joins blog_post_categories, blog_post_tags, and author profile.
 */
export const BLOG_POST_LIST_SELECT = `
  id,
  title,
  slug,
  excerpt,
  status,
  published_at,
  featured_image_url,
  featured_image_alt,
  reading_time_minutes,
  is_featured,
  created_at,
  profiles (
    id,
    first_name,
    last_name,
    avatar_url
  ),
  blog_post_categories (
    blog_categories (
      id,
      name,
      slug
    )
  ),
  blog_post_tags (
    blog_tags (
      id,
      name,
      slug
    )
  )
`;

/**
 * Full SELECT query for the blog post detail page — same as list but includes content and SEO fields.
 */
export const BLOG_POST_DETAIL_SELECT = `
  id,
  title,
  slug,
  excerpt,
  content,
  status,
  published_at,
  featured_image_url,
  featured_image_alt,
  meta_title,
  meta_description,
  canonical_url,
  reading_time_minutes,
  is_featured,
  created_at,
  updated_at,
  profiles (
    id,
    first_name,
    last_name,
    avatar_url
  ),
  blog_post_categories (
    blog_categories (
      id,
      name,
      slug
    )
  ),
  blog_post_tags (
    blog_tags (
      id,
      name,
      slug
    )
  )
`;
