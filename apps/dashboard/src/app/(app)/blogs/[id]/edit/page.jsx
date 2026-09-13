import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogPostForm } from "../../_components/blog-post-form";

export const metadata = {
  title: "Edit Blog Post | Dashboard",
  description: "Edit existing blog post",
};

export default async function EditBlogPostPage({ params }) {
  const { id } = await params;
  const postId = Number(id);

  if (!postId || isNaN(postId)) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch post details
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      blog_post_categories(category_id),
      blog_post_tags(tag_id)
    `)
    .eq("id", postId)
    .single();

  if (error || !post) {
    notFound();
  }

  // Fetch related options in parallel
  const [
    { data: categories },
    { data: tags },
    { data: authors },
    { data: prodRows },
    { data: relatedRows },
  ] = await Promise.all([
    supabase.from("blog_categories").select("id, name, slug").order("name"),
    supabase.from("blog_tags").select("id, name, slug").order("name"),
    supabase.from("profiles").select("id, first_name, last_name, email").order("first_name"),
    supabase.from("blog_post_products").select("product_id, sort_order").eq("post_id", postId).order("sort_order"),
    supabase.from("blog_post_related_posts").select("related_post_id, sort_order").eq("post_id", postId).order("sort_order"),
  ]);

  // Fetch referenced products details
  const productIds = prodRows?.map((r) => r.product_id) || [];
  let referencedProducts = [];
  if (productIds.length > 0) {
    const { data: prods } = await supabase
      .from("products")
      .select("id, name, slug, sku, product_variants(price), product_images(storage_path, is_banner)")
      .in("id", productIds);
    referencedProducts = prods || [];
  }

  // Fetch related posts details
  const relatedPostIds = relatedRows?.map((r) => r.related_post_id) || [];
  let relatedPosts = [];
  if (relatedPostIds.length > 0) {
    const { data: rels } = await supabase
      .from("blog_posts")
      .select("id, title, slug, status, featured_image_url")
      .in("id", relatedPostIds);
    relatedPosts = rels || [];
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-4">
      <BlogPostForm
        mode="edit"
        initialValues={{
          ...post,
          category_ids: post.blog_post_categories?.map((c) => c.category_id) || [],
          tag_ids: post.blog_post_tags?.map((t) => t.tag_id) || [],
          product_ids: productIds,
          related_post_ids: relatedPostIds,
        }}
        categories={categories || []}
        tags={tags || []}
        authors={authors || []}
        referencedProducts={referencedProducts}
        relatedPosts={relatedPosts}
      />
    </div>
  );
}
