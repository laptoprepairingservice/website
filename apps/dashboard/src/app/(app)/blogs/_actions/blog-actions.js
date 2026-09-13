"use server";

import { revalidatePath } from "next/cache";
import { formatSupabaseError } from "@/lib/supabase/format-error";
import { getCurrentUser } from "@/lib/user";
import { createClient } from "@/lib/supabase/server";
import {
  blogCategorySchema,
  blogPostFormSchema,
  blogTagSchema,
  calculateReadingTime,
} from "../_lib/blog-schema";
import { uploadBlogFile } from "@/lib/supabase/storage";

function emptyToNull(val) {
  if (val === "" || val === undefined) return null;
  return val;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin." };
  }
  return { user };
}

export async function uploadBlogImageAction(formData) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return { error: "No image file provided for upload." };
  }

  const postId = formData.get("postId") || "draft";
  const supabase = await createClient();

  const { publicUrl, error: uploadError } = await uploadBlogFile(supabase, file, {
    postId,
    fileName: file.name,
  });

  if (uploadError) {
    return { error: formatSupabaseError(uploadError) };
  }

  return { publicUrl };
}

export async function createBlogPostAction(values) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  const parsed = blogPostFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid blog post data." };
  }

  const data = parsed.data;
  const supabase = await createClient();

  // Compute reading time if needed
  const readingTime = data.reading_time_minutes || calculateReadingTime(data.content);

  // Status & published_at
  let publishedAt = data.published_at ? new Date(data.published_at).toISOString() : null;
  if (data.status === "published" && !publishedAt) {
    publishedAt = new Date().toISOString();
  }

  // 1. Insert blog_posts row
  const postPayload = {
    title: data.title.trim(),
    slug: data.slug.trim(),
    excerpt: emptyToNull(data.excerpt?.trim()),
    content: data.content,
    status: data.status,
    published_at: publishedAt,
    author_id: emptyToNull(data.author_id) || auth.user.id,
    featured_image_url: emptyToNull(data.featured_image_url?.trim()),
    featured_image_alt: emptyToNull(data.featured_image_alt?.trim()),
    meta_title: emptyToNull(data.meta_title?.trim()),
    meta_description: emptyToNull(data.meta_description?.trim()),
    canonical_url: emptyToNull(data.canonical_url?.trim()),
    reading_time_minutes: readingTime,
    is_featured: data.is_featured,
  };

  const { data: insertedPost, error: insertError } = await supabase
    .from("blog_posts")
    .insert(postPayload)
    .select("id, slug")
    .single();

  if (insertError) {
    return { error: formatSupabaseError(insertError) };
  }

  const postId = insertedPost.id;

  // 2. Insert blog_post_categories
  if (data.category_ids && data.category_ids.length > 0) {
    const categoryRows = data.category_ids.map((catId) => ({
      post_id: postId,
      category_id: catId,
    }));
    const { error: catError } = await supabase.from("blog_post_categories").insert(categoryRows);
    if (catError) console.error("Error inserting post categories:", catError);
  }

  // 3. Insert blog_post_tags
  if (data.tag_ids && data.tag_ids.length > 0) {
    const tagRows = data.tag_ids.map((tagId) => ({
      post_id: postId,
      tag_id: tagId,
    }));
    const { error: tagError } = await supabase.from("blog_post_tags").insert(tagRows);
    if (tagError) console.error("Error inserting post tags:", tagError);
  }

  // 4. Insert blog_post_products
  if (data.product_ids && data.product_ids.length > 0) {
    const productRows = data.product_ids.map((prodId, idx) => ({
      post_id: postId,
      product_id: prodId,
      sort_order: idx,
    }));
    const { error: prodError } = await supabase.from("blog_post_products").insert(productRows);
    if (prodError) console.error("Error inserting post products:", prodError);
  }

  // 5. Insert blog_post_related_posts
  if (data.related_post_ids && data.related_post_ids.length > 0) {
    const relatedRows = data.related_post_ids
      .filter((rId) => rId !== postId)
      .map((rId, idx) => ({
        post_id: postId,
        related_post_id: rId,
        sort_order: idx,
      }));
    if (relatedRows.length > 0) {
      const { error: relError } = await supabase.from("blog_post_related_posts").insert(relatedRows);
      if (relError) console.error("Error inserting related posts:", relError);
    }
  }

  revalidatePath("/blogs");
  return { data: insertedPost };
}

export async function updateBlogPostAction(values) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  if (!values.id) {
    return { error: "Post ID is required for updating." };
  }

  const parsed = blogPostFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid blog post data." };
  }

  const data = parsed.data;
  const postId = Number(values.id);
  const supabase = await createClient();

  const readingTime = data.reading_time_minutes || calculateReadingTime(data.content);

  let publishedAt = data.published_at ? new Date(data.published_at).toISOString() : null;
  if (data.status === "published" && !publishedAt) {
    publishedAt = new Date().toISOString();
  }

  const postPayload = {
    title: data.title.trim(),
    slug: data.slug.trim(),
    excerpt: emptyToNull(data.excerpt?.trim()),
    content: data.content,
    status: data.status,
    published_at: publishedAt,
    author_id: emptyToNull(data.author_id) || auth.user.id,
    featured_image_url: emptyToNull(data.featured_image_url?.trim()),
    featured_image_alt: emptyToNull(data.featured_image_alt?.trim()),
    meta_title: emptyToNull(data.meta_title?.trim()),
    meta_description: emptyToNull(data.meta_description?.trim()),
    canonical_url: emptyToNull(data.canonical_url?.trim()),
    reading_time_minutes: readingTime,
    is_featured: data.is_featured,
  };

  const { error: updateError } = await supabase
    .from("blog_posts")
    .update(postPayload)
    .eq("id", postId);

  if (updateError) {
    return { error: formatSupabaseError(updateError) };
  }

  // Reconcile categories
  await supabase.from("blog_post_categories").delete().eq("post_id", postId);
  if (data.category_ids && data.category_ids.length > 0) {
    const categoryRows = data.category_ids.map((catId) => ({
      post_id: postId,
      category_id: catId,
    }));
    await supabase.from("blog_post_categories").insert(categoryRows);
  }

  // Reconcile tags
  await supabase.from("blog_post_tags").delete().eq("post_id", postId);
  if (data.tag_ids && data.tag_ids.length > 0) {
    const tagRows = data.tag_ids.map((tagId) => ({
      post_id: postId,
      tag_id: tagId,
    }));
    await supabase.from("blog_post_tags").insert(tagRows);
  }

  // Reconcile products
  await supabase.from("blog_post_products").delete().eq("post_id", postId);
  if (data.product_ids && data.product_ids.length > 0) {
    const productRows = data.product_ids.map((prodId, idx) => ({
      post_id: postId,
      product_id: prodId,
      sort_order: idx,
    }));
    await supabase.from("blog_post_products").insert(productRows);
  }

  // Reconcile related posts
  await supabase.from("blog_post_related_posts").delete().eq("post_id", postId);
  if (data.related_post_ids && data.related_post_ids.length > 0) {
    const relatedRows = data.related_post_ids
      .filter((rId) => rId !== postId)
      .map((rId, idx) => ({
        post_id: postId,
        related_post_id: rId,
        sort_order: idx,
      }));
    if (relatedRows.length > 0) {
      await supabase.from("blog_post_related_posts").insert(relatedRows);
    }
  }

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${postId}/edit`);
  return { success: true };
}

/**
 * Hard delete blog post as requested
 */
export async function deleteBlogPostAction(id) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) {
    return { error: formatSupabaseError(error) };
  }

  revalidatePath("/blogs");
  return { success: true };
}

export async function updateBlogPostStatusAction(id, status) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  const supabase = await createClient();
  const payload = { status };

  if (status === "published") {
    // Check if published_at is already set
    const { data: current } = await supabase
      .from("blog_posts")
      .select("published_at")
      .eq("id", id)
      .single();

    if (!current?.published_at) {
      payload.published_at = new Date().toISOString();
    }
  }

  const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);

  if (error) {
    return { error: formatSupabaseError(error) };
  }

  revalidatePath("/blogs");
  return { success: true };
}

// -----------------------------------------------------------------------------
// Categories Actions
// -----------------------------------------------------------------------------

export async function createBlogCategoryAction(values) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  const parsed = blogCategorySchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid category data." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .insert({
      name: parsed.data.name.trim(),
      slug: parsed.data.slug.trim(),
      description: emptyToNull(parsed.data.description?.trim()),
    })
    .select()
    .single();

  if (error) return { error: formatSupabaseError(error) };

  revalidatePath("/blogs");
  return { data };
}

export async function updateBlogCategoryAction(values) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  const parsed = blogCategorySchema.safeParse(values);
  if (!parsed.success || !values.id) {
    return { error: "Valid ID and data are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .update({
      name: parsed.data.name.trim(),
      slug: parsed.data.slug.trim(),
      description: emptyToNull(parsed.data.description?.trim()),
    })
    .eq("id", values.id)
    .select()
    .single();

  if (error) return { error: formatSupabaseError(error) };

  revalidatePath("/blogs");
  return { data };
}

export async function deleteBlogCategoryAction(id) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("blog_categories").delete().eq("id", id);

  if (error) return { error: formatSupabaseError(error) };

  revalidatePath("/blogs");
  return { success: true };
}

// -----------------------------------------------------------------------------
// Tags Actions
// -----------------------------------------------------------------------------

export async function createBlogTagAction(values) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  const parsed = blogTagSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid tag data." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_tags")
    .insert({
      name: parsed.data.name.trim(),
      slug: parsed.data.slug.trim(),
    })
    .select()
    .single();

  if (error) return { error: formatSupabaseError(error) };

  revalidatePath("/blogs");
  return { data };
}

export async function updateBlogTagAction(values) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  const parsed = blogTagSchema.safeParse(values);
  if (!parsed.success || !values.id) {
    return { error: "Valid ID and data are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_tags")
    .update({
      name: parsed.data.name.trim(),
      slug: parsed.data.slug.trim(),
    })
    .eq("id", values.id)
    .select()
    .single();

  if (error) return { error: formatSupabaseError(error) };

  revalidatePath("/blogs");
  return { data };
}

export async function deleteBlogTagAction(id) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("blog_tags").delete().eq("id", id);

  if (error) return { error: formatSupabaseError(error) };

  revalidatePath("/blogs");
  return { success: true };
}
