import { getPublicSupabaseClient } from "@/lib/store/client";
import { mapSupabaseBlogPost } from "./mapper";
import { BLOG_POST_DETAIL_SELECT, BLOG_POST_LIST_SELECT } from "./select";

/**
 * Fetches published blog posts with optional category filter and pagination.
 *
 * @param {{ category?: string|null, page?: number, limit?: number }} options
 * @returns {Promise<{ posts: object[], total: number }>}
 */
export async function fetchBlogPosts({ category = null, page = 1, limit = 9 } = {}) {
  try {
    const supabase = getPublicSupabaseClient();
    const offset = (Math.max(1, page) - 1) * limit;

    let query = supabase
      .from("blog_posts")
      .select(BLOG_POST_LIST_SELECT, { count: "exact" })
      .eq("status", "published")
      .is("deleted_at", null)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching blog posts:", error);
      return { posts: [], total: 0 };
    }

    let posts = (data || []).map(mapSupabaseBlogPost).filter(Boolean);

    // Filter by category slug in-memory (join traversal is simpler this way)
    if (category) {
      posts = posts.filter((p) =>
        p.categories.some((c) => c.slug === category)
      );
    }

    return { posts, total: count ?? posts.length };
  } catch (err) {
    console.error("Failed to fetch blog posts:", err);
    return { posts: [], total: 0 };
  }
}

/**
 * Fetches a single published blog post by slug.
 *
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function fetchBlogPostBySlug(slug) {
  if (!slug) return null;
  try {
    const supabase = getPublicSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(BLOG_POST_DETAIL_SELECT)
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      console.error("Error fetching blog post by slug:", error);
      return null;
    }

    return mapSupabaseBlogPost(data);
  } catch (err) {
    console.error("Failed to fetch blog post by slug:", err);
    return null;
  }
}

/**
 * Fetches all blog categories that have at least one published post.
 *
 * @returns {Promise<Array<{ id: number, name: string, slug: string, description: string|null }>>}
 */
export async function fetchBlogCategories() {
  try {
    const supabase = getPublicSupabaseClient();
    const { data, error } = await supabase
      .from("blog_categories")
      .select("id, name, slug, description")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching blog categories:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Failed to fetch blog categories:", err);
    return [];
  }
}

/**
 * Fetches related blog posts (same category, excluding current post).
 *
 * @param {object} post - The current mapped blog post
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
export async function fetchRelatedBlogPosts(post, limit = 3) {
  if (!post) return [];
  try {
    const supabase = getPublicSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(BLOG_POST_LIST_SELECT)
      .eq("status", "published")
      .is("deleted_at", null)
      .neq("id", post.id)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []).map(mapSupabaseBlogPost).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Fetches all published blog post slugs (for generateStaticParams / sitemap).
 *
 * @returns {Promise<Array<{ slug: string, published_at: string }>>}
 */
export async function fetchAllBlogSlugs() {
  try {
    const supabase = getPublicSupabaseClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("slug, published_at")
      .eq("status", "published")
      .is("deleted_at", null);
    return data || [];
  } catch {
    return [];
  }
}
