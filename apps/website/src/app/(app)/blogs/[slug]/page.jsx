import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { fetchBlogPostBySlug, fetchRelatedBlogPosts, fetchAllBlogSlugs } from "@/lib/blog";
import { BlogGrid } from "@/components/blog/blog-card";
import { BlogToc } from "@/components/blog/blog-toc";
import { BlogFaqAccordion } from "@/components/blog/blog-faq";
import { Badge } from "@ui/shadcn/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ui/shadcn/components/breadcrumb";
import Script from "next/script";
import { Icon } from "@iconify/react";

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
    description: post.excerpt,
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

/** Slugify heading text into a stable DOM id. */
function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Parse h2/h3/h4 from HTML, inject id attributes, return both
 * the patched HTML and the heading list for the TOC.
 */
function extractHeadings(html) {
  if (!html) return { html: "", headings: [] };

  const headings = [];
  const idCount = {};

  const patched = html.replace(
    /<(h[234])([^>]*)>([\s\S]*?)<\/h[234]>/gi,
    (match, tag, attrs, inner) => {
      const level = parseInt(tag[1], 10);
      const text = inner.replace(/<[^>]+>/g, "").trim();
      let id = slugifyHeading(text) || `heading-${headings.length}`;
      idCount[id] = (idCount[id] || 0) + 1;
      if (idCount[id] > 1) id = `${id}-${idCount[id]}`;
      headings.push({ id, text, level });
      const cleanAttrs = attrs.replace(/\s*id="[^"]*"/gi, "");
      return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
    }
  );

  return { html: patched, headings };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) notFound();

  const relatedPosts = await fetchRelatedBlogPosts(post, 3);
  const date = formatBlogDate(post.publishedAt || post.createdAt);
  const { html: patchedContent, headings } = extractHeadings(post.content);
  const hasFaqs = post.faqs?.length > 0;

  return (
    <div className="container py-5 sm:py-7 lg:py-10">
      {/* Schema.org JSON-LD injected from Supabase */}
      {post.schemaOrgJsonld && (
        <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: post.schemaOrgJsonld }}
        />
      )}

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
            <BreadcrumbPage className="max-w-45 truncate sm:max-w-xs">{post.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col items-center pt-10 text-center">
        <h1 className="text-3xl leading-snug font-bold tracking-tight text-balance sm:text-3xl lg:text-5xl">
          {post.title}
        </h1>
        <h2 className="mt-4 text-sm leading-snug font-normal tracking-tight text-balance lg:text-xl">
          {post.excerpt}
        </h2>

        <div className="my-6 flex flex-col items-center gap-2">
          {post.author?.avatarUrl ? (
            <Image
              src={post.author.avatarUrl}
              alt={post.author.name}
              width={28}
              height={28}
              unoptimized
              className="ring-border size-14 rounded-full object-cover ring-1"
            />
          ) : (
            <span className="bg-primary/20 text-primary flex size-14 shrink-0 items-center justify-center rounded-full text-2xl font-bold">
              {post.author?.name
                ?.split(" ")
                ?.map((n) => n[0])
                .join("") ?? "A"}
            </span>
          )}
          <span className="text-foreground font-medium">{post.author?.name ?? "Author"}</span>
        </div>
        <div className="text-muted-foreground mt-2 flex w-full flex-col justify-between gap-3 border-y py-4 md:flex-row">
          <div className="flex items-center">
            <Icon icon="tabler:calendar" className="mr-1 size-4" /> Last update at{" "}
            {formatBlogDate(post.updatedAt)}
          </div>
          <div>
            {post.readingTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {post.readingTime} min read
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two-column: article + sticky sidebar */}
      <div className="mt-6 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_256px]">
        <article>
          {post.featuredImage && (
            <div className="bg-muted relative aspect-video overflow-hidden rounded-2xl">
              <Image
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Meta row */}
          <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-4 border-b pb-5 text-sm">
            {date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {date}
              </span>
            )}
          </div>

          {/* Blog Content (headings have injected ids) */}
          {patchedContent && (
            <div
              className="prose prose-neutral dark:prose-invert /* ───────────────────────────────────── Base typography ───────────────────────────────────── */ prose-p:text-foreground/90 prose-p:leading-7 prose-p:my-5 prose-lead:text-lg prose-lead:leading-8 prose-lead:text-muted-foreground /* ───────────────────────────────────── Headings ───────────────────────────────────── */ prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-headings:scroll-mt-24 prose-h1:text-3xl prose-h1:leading-tight prose-h1:mt-0 prose-h1:mb-6 prose-h2:text-2xl prose-h2:leading-tight prose-h2:mt-12 prose-h2:mb-5 prose-h3:text-xl prose-h3:leading-snug prose-h3:mt-10 prose-h3:mb-4 prose-h4:text-lg prose-h4:leading-snug prose-h4:mt-8 prose-h4:mb-3 prose-h5:text-base prose-h5:mt-6 prose-h5:mb-2 prose-h6:text-sm prose-h6:uppercase prose-h6:tracking-wide prose-h6:mt-6 prose-h6:mb-2 sm:prose-h1:text-4xl sm:prose-h2:text-3xl sm:prose-h3:text-2xl /* ───────────────────────────────────── Links ───────────────────────────────────── */ prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4 prose-a:decoration-primary/40 hover:prose-a:decoration-primary /* ───────────────────────────────────── Lists ───────────────────────────────────── */ prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-li:leading-7 prose-li:marker:text-muted-foreground /* ───────────────────────────────────── Strong / emphasis ───────────────────────────────────── */ prose-strong:text-foreground prose-strong:font-semibold prose-em:text-foreground /* ───────────────────────────────────── Images ───────────────────────────────────── */ prose-img:my-8 prose-img:w-full prose-img:max-w-full prose-img:rounded-xl prose-img:border prose-img:border-border/60 prose-img:shadow-sm /* ───────────────────────────────────── Figure / captions ───────────────────────────────────── */ prose-figure:my-8 prose-figcaption:mt-3 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-muted-foreground prose-figcaption:leading-6 /* ───────────────────────────────────── Blockquotes ───────────────────────────────────── */ prose-blockquote:my-8 prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:not-italic prose-blockquote:text-muted-foreground /* ───────────────────────────────────── Inline code ───────────────────────────────────── */ prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-medium prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none /* ───────────────────────────────────── Code blocks ───────────────────────────────────── */ prose-pre:my-8 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-muted/60 prose-pre:p-4 prose-pre:text-sm prose-pre:leading-6 /* ───────────────────────────────────── Keyboard ───────────────────────────────────── */ prose-kbd:rounded-md prose-kbd:border prose-kbd:border-border prose-kbd:bg-muted prose-kbd:px-1.5 prose-kbd:py-0.5 prose-kbd:text-xs prose-kbd:font-medium /* ───────────────────────────────────── Horizontal rules ───────────────────────────────────── */ prose-hr:my-10 prose-hr:border-border /* ───────────────────────────────────── Tables ───────────────────────────────────── */ prose-table:my-8 prose-table:w-full prose-table:overflow-hidden prose-table:rounded-xl prose-table:border prose-table:border-border prose-thead:border-b prose-thead:border-border prose-th:bg-muted/60 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-sm prose-th:font-semibold prose-th:text-foreground prose-td:border-b prose-td:border-border/60 prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:leading-6 prose-tr:border-border/60 /* ───────────────────────────────────── Mark / highlighted text ───────────────────────────────────── */ prose-mark:rounded prose-mark:bg-yellow-200 prose-mark:px-1 prose-mark:text-inherit dark:prose-mark:bg-yellow-500/30 /* ───────────────────────────────────── Details / Summary ───────────────────────────────────── */ prose-details:my-6 prose-details:rounded-xl prose-details:border prose-details:border-border prose-details:bg-muted/30 prose-details:px-4 prose-details:py-3 prose-summary:cursor-pointer prose-summary:font-semibold prose-summary:text-foreground /* ───────────────────────────────────── Media / embeds ───────────────────────────────────── */ prose-video:my-8 prose-video:w-full prose-video:rounded-xl prose-iframe:my-8 prose-iframe:w-full prose-iframe:max-w-full prose-iframe:rounded-xl prose-iframe:border prose-iframe:border-border /* ───────────────────────────────────── Spacing ───────────────────────────────────── */ prose:first-child:mt-0 prose:last-child:mb-0 /* ───────────────────────────────────── Responsive content ───────────────────────────────────── */ /* ───────────────────────────────────── Mobile ───────────────────────────────────── */ /* ───────────────────────────────────── Prevent long content overflow ───────────────────────────────────── */ mt-8 w-full max-w-none text-[15px] leading-7 [overflow-wrap:anywhere] break-words sm:text-base sm:leading-7"
              dangerouslySetInnerHTML={{ __html: patchedContent }}
            />
          )}

          {/* FAQ Accordion */}
          {hasFaqs && (
            <section id="blog-faqs" className="mt-12 scroll-mt-24 border-t pt-8">
              <h2 className="mb-5 text-xl font-bold tracking-tight">Frequently Asked Questions</h2>
              <BlogFaqAccordion faqs={post.faqs} />
            </section>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 border-t pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="text-muted-foreground size-4 shrink-0" />
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/blogs?tag=${tag.slug}`}>
                    <Badge
                      variant="outline"
                      className="hover:bg-muted cursor-pointer rounded-full text-xs transition-colors"
                    >
                      #{tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* ── Sticky Sidebar ── */}
        <aside className="sticky top-24 hidden lg:block">
          <div className="space-y-6">
            {/* Post categories */}
            {post.categories.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-3 text-[11px] font-bold tracking-widest uppercase">
                  Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {post.categories.map((cat) => (
                    <Link key={cat.id} href={`/blogs?category=${cat.slug}`}>
                      <Badge
                        variant="outline"
                        className="hover:bg-primary/10 hover:text-primary hover:border-primary/40 cursor-pointer rounded-full text-xs transition-colors"
                      >
                        {cat.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Divider before TOC */}
            {post.categories.length > 0 && (headings.length > 0 || hasFaqs) && (
              <hr className="border-border/50" />
            )}

            {/* Table of Contents */}
            <BlogToc headings={headings} hasFaqs={hasFaqs} />
          </div>
        </aside>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 border-t pt-10">
          <h2 className="mb-6 text-xl font-bold tracking-tight">Related Articles</h2>
          <BlogGrid posts={relatedPosts} />
        </section>
      )}
    </div>
  );
}
