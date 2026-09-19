"use client";

import List from "@/components/react-list";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { Badge } from "@ui/shadcn/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ui/shadcn/components/breadcrumb";
import { ShimmerEffect } from "@/components/shimmer";
import { mapSupabaseBlogPost } from "@/lib/blog/mapper";
import { useState } from "react";

const BLOG_SELECT = `
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
 * Shimmer card grid shown while blog posts are loading.
 */
function BlogGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-card overflow-hidden rounded-2xl border">
          <ShimmerEffect className="aspect-[16/9] w-full" />
          <div className="space-y-3 p-5">
            <ShimmerEffect className="h-4 w-1/3 rounded-full" />
            <ShimmerEffect className="h-5 w-full rounded" />
            <ShimmerEffect className="h-5 w-3/4 rounded" />
            <ShimmerEffect className="h-4 w-full rounded" />
            <ShimmerEffect className="h-4 w-2/3 rounded" />
            <div className="flex justify-between pt-2">
              <ShimmerEffect className="h-3 w-20 rounded" />
              <ShimmerEffect className="h-3 w-16 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Blog listing client component — uses the app's existing List wrapper
 * (which internally handles ReactListProvider, ReactList, pagination, loaders etc.)
 *
 * @param {{ categories: Array<{ id: number, name: string, slug: string }> }} props
 */
export function BlogsClient({ categories = [] }) {
  const [activeCategory, setActiveCategory] = useState(null);

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
            <BreadcrumbPage>Blog</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mt-6 mb-8">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Laptop Accessories Thoughtful Insights
          </h1>
        </div>
        <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
          Tips, guides, and news on laptops, PC components, repairs, and tech upgrades.
        </p>
      </div>

      {/* Category Filter Chips */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory(null)}>
            <Badge
              variant={!activeCategory ? "default" : "outline"}
              className="hover:bg-primary hover:text-primary-foreground cursor-pointer rounded-full px-4 py-1.5 text-sm transition-colors"
            >
              All
            </Badge>
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.slug)}>
              <Badge
                variant={activeCategory === cat.slug ? "default" : "outline"}
                className="hover:bg-primary hover:text-primary-foreground cursor-pointer rounded-full px-4 py-1.5 text-sm transition-colors"
              >
                {cat.name}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* Blog post grid via the shared List wrapper */}
      <List
        endpoint="blog_posts"
        perPage={9}
        sortBy="published_at"
        sortOrder="desc"
        showHeader={false}
        showListHeader={false}
        showSearch={false}
        filters={{ status: "published" }}
        meta={{
          select: BLOG_SELECT,
          filters: {
            status: { column: "status", operator: "eq" },
          },
        }}
        shimmer={<BlogGridSkeleton />}
        className="p-0!"
      >
        {({ items }) => {
          const posts = items.map(mapSupabaseBlogPost).filter(Boolean);
          const filtered = activeCategory
            ? posts.filter((p) => p.categories.some((c) => c.slug === activeCategory))
            : posts;

          if (filtered.length === 0) {
            return (
              <div className="border-border bg-card/40 rounded-2xl border border-dashed px-6 py-20 text-center">
                <div className="bg-muted text-muted-foreground mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
                  <BookOpen className="size-7 opacity-50" />
                </div>
                <h2 className="text-foreground text-lg font-bold">No posts yet</h2>
                <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
                  {activeCategory
                    ? "No published posts found in this category. Try a different filter."
                    : "We haven't published any blog posts yet. Check back soon!"}
                </p>
                {activeCategory && (
                  <div className="mt-5">
                    <button
                      onClick={() => setActiveCategory(null)}
                      className="border-border hover:bg-muted inline-flex items-center justify-center rounded-full border px-5 py-2 text-sm font-medium transition-colors"
                    >
                      Clear filter
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          );
        }}
      </List>
    </div>
  );
}
