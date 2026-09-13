import { createClient } from "@/lib/supabase/server";
import { BlogPostForm } from "../_components/blog-post-form";

export const metadata = {
  title: "New Blog Post | Dashboard",
  description: "Create and publish a new blog post",
};

export default async function NewBlogPostPage() {
  const supabase = await createClient();

  const [
    { data: categories },
    { data: tags },
    { data: authors },
  ] = await Promise.all([
    supabase.from("blog_categories").select("id, name, slug").order("name"),
    supabase.from("blog_tags").select("id, name, slug").order("name"),
    supabase.from("profiles").select("id, first_name, last_name, email").order("first_name"),
  ]);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-4">
      <BlogPostForm
        mode="new"
        categories={categories || []}
        tags={tags || []}
        authors={authors || []}
      />
    </div>
  );
}
