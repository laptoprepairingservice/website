import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { fetchBlogPostBySlug, fetchRelatedBlogPosts, fetchAllBlogSlugs } from "@/lib/blog";
import { BlogGrid } from "@/components/blog/blog-card";
import { Badge } from "@ui/shadcn/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ui/shadcn/components/breadcrumb";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await fetchAllBlogSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.metaTitle || post.title} | Ranuja Blog`,
    description: post.metaDescription || post.excerpt,
    alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.featuredImage ? [{ url: post.featuredImage, alt: post.featuredImageAlt }] : [],
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
  };
}

function formatBlogDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await fetchRelatedBlogPosts(post, 3);
  const date = formatBlogDate(post.publishedAt || post.createdAt);

  return (
    <div className="container py-5 sm:py-7 lg:py-10">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/blogs">Blog</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate max-w-[180px] sm:max-w-xs">
              {post.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back link */}
      <Link
        href="/blogs"
        className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to Blog
      </Link>

      {/* Article */}
      <article className="mt-6 max-w-3xl mx-auto">
        {/* Category chips */}
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((cat) => (
              <Link key={cat.id} href={`/blogs?category=${cat.slug}`}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer rounded-full text-xs px-3 py-1 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight leading-snug sm:text-3xl lg:text-4xl text-balance">
          {post.title}
        </h1>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-5">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.author?.avatarUrl ? (
              <Image
                src={post.author.avatarUrl}
                alt={post.author.name}
                width={28}
                height={28}
                unoptimized
                className="rounded-full object-cover size-7 ring-1 ring-border"
              />
            ) : (
              <span className="size-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                {post.author?.name?.[0] ?? "A"}
              </span>
            )}
            <span className="font-medium text-foreground">
              {post.author?.name ?? "Author"}
            </span>
          </div>

          {date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {date}
            </span>
          )}

          {post.readingTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {post.readingTime} min read
            </span>
          )}
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mt-6 relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
            <Image
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Blog Content */}
        {post.content && (
          <div
            className="mt-8 prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-md
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="size-4 text-muted-foreground shrink-0" />
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/blogs?tag=${tag.slug}`}>
                  <Badge
                    variant="outline"
                    className="rounded-full text-xs cursor-pointer hover:bg-muted transition-colors"
                  >
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-10 border-t">
          <h2 className="text-xl font-bold tracking-tight mb-6">Related Articles</h2>
          <BlogGrid posts={relatedPosts} />
        </section>
      )}
    </div>
  );
}
