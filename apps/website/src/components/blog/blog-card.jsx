import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Tag } from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { cn } from "@/lib/utils";

/**
 * Formats a date string to a human-readable format.
 * @param {string|null} dateStr
 */
function formatBlogDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Single blog post card for use in the listing grid.
 *
 * @param {{ post: object, className?: string }} props
 */
export function BlogCard({ post, className }) {
  const date = formatBlogDate(post.publishedAt || post.createdAt);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-0.5",
        className
      )}
    >
      {/* Featured Image */}
      <Link
        href={`/blogs/${post.slug}`}
        className="relative block aspect-[16/9] overflow-hidden bg-muted/30"
        tabIndex={-1}
        aria-hidden="true"
      >
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Gradient placeholder */
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-primary/5 flex items-center justify-center">
            <Tag className="size-10 text-muted-foreground/30" />
          </div>
        )}

        {/* Featured badge overlay */}
        {post.isFeatured && (
          <div className="absolute left-3 top-3 z-10">
            <Badge className="bg-primary text-primary-foreground text-[11px] font-semibold px-2 py-0.5 shadow">
              Featured
            </Badge>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 gap-3">
        {/* Category chips */}
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.categories.slice(0, 2).map((cat) => (
              <Link key={cat.id} href={`/blogs?category=${cat.slug}`}>
                <Badge
                  variant="secondary"
                  className="text-[11px] px-2 py-0.5 rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/blogs/${post.slug}`} className="block group/title">
          <h2 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight transition-colors group-hover/title:text-primary">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Footer: date + reading time */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {/* Author avatar */}
            {post.author?.avatarUrl ? (
              <Image
                src={post.author.avatarUrl}
                alt={post.author.name}
                width={20}
                height={20}
                unoptimized
                className="rounded-full object-cover size-5 ring-1 ring-border"
              />
            ) : (
              <span className="size-5 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                {post.author?.name?.[0] ?? "A"}
              </span>
            )}
            <span className="font-medium text-foreground/70 truncate max-w-[100px]">
              {post.author?.name ?? "Author"}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {date && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {date}
              </span>
            )}
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {post.readingTime} min
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Grid of BlogCard components.
 *
 * @param {{ posts: object[], className?: string }} props
 */
export function BlogGrid({ posts = [], className }) {
  return (
    <div
      className={cn(
        "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
