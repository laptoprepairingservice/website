import { SectionHeader } from "./section-header";
import { BlogCard } from "@/components/blog/blog-card";
import { fetchBlogPosts } from "@/lib/blog";
import { cn } from "@/lib/utils";

/**
 * LatestBlogsSection - Displays latest blog posts in a 4-column grid.
 *
 * @param {{
 *   posts?: object[],
 *   limit?: number,
 *   title?: string,
 *   description?: string,
 *   className?: string
 * }} props
 */
export async function LatestBlogsSection({
  posts: initialPosts,
  limit = 4,
  title = "Latest from Our Blog",
  description = "Hardware maintenance tips, DIY repair guides, and laptop upgrade tutorials.",
  className,
}) {
  let posts = initialPosts;
  if (!posts) {
    const res = await fetchBlogPosts({ limit });
    posts = res?.posts || [];
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className={cn("border-border/80 border-t bg-muted/20 py-10 sm:py-12 lg:py-16", className)}>
      <div className="container">
        <SectionHeader
          badge="Guides & Insights"
          title={title}
          description={description}
          href="/blogs"
          linkText="See All"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {posts.slice(0, limit).map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
