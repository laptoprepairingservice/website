"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/user";
import { createClient } from "@/lib/supabase/server";
import { productReviewSchema } from "../_lib/review-schema";
import { isUuid } from "../_lib/uuid";

/**
 * Format any Supabase errors into human-readable error messages.
 */
function formatReviewError(error, defaultMessage = "An error occurred with product reviews.") {
  if (!error) return defaultMessage;
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  return defaultMessage;
}

/**
 * Fetch registered users/customers from profiles for the review user-selection component.
 */
export async function getReviewCustomersAction(search = "") {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("profiles")
      .select("id, first_name, last_name, email, avatar_url, role")
      .order("first_name", { ascending: true })
      .limit(50);

    const clean = search?.trim();
    if (clean) {
      query = query.or(
        `first_name.ilike.%${clean}%,last_name.ilike.%${clean}%,email.ilike.%${clean}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching customers for review selection:", error);
      return [];
    }

    return (data || []).map((p) => ({
      id: p.id,
      name: [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email || "Unnamed Customer",
      firstName: p.first_name || "",
      lastName: p.last_name || "",
      email: p.email || "",
      avatarUrl: p.avatar_url,
      role: p.role || "customer",
    }));
  } catch (err) {
    console.error("Failed to fetch review customers:", err);
    return [];
  }
}

/**
 * Fetch product details and all reviews for a specific product.
 */
export async function getProductReviewsForProductAction(productIdentifier) {
  try {
    const supabase = await createClient();

    // 1. Resolve product by public_id or integer id
    let productQuery = supabase
      .from("products")
      .select(`
        id,
        public_id,
        name,
        slug,
        sku,
        status,
        categories:category_id (name, slug),
        brands:brand_id (name, slug),
        product_images (storage_path, is_banner, sort_order)
      `);

    const rawId = String(productIdentifier || "").trim();
    if (/^\d+$/.test(rawId)) {
      productQuery = productQuery.eq("id", Number(rawId));
    } else if (isUuid(rawId)) {
      productQuery = productQuery.eq("public_id", rawId);
    } else {
      productQuery = productQuery.eq("slug", rawId);
    }

    const { data: product, error: productError } = await productQuery.maybeSingle();

    if (productError || !product) {
      if (productError) {
        console.error("Error fetching product for reviews:", productError);
      }
      return { error: "Product not found." };
    }

    // 2. Fetch reviews for this product
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      return {
        error: formatReviewError(reviewsError, "Failed to load product reviews."),
        product,
        reviews: [],
        stats: { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      };
    }

    const reviews = reviewsData || [];

    // 3. Attach profile info for reviews that have user_id
    const userIds = [...new Set(reviews.map((r) => r.user_id).filter(Boolean))];
    let profileMap = new Map();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, avatar_url, role")
        .in("id", userIds);

      profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    }

    const enrichedReviews = reviews.map((r) => {
      const userProfile = r.user_id ? profileMap.get(r.user_id) : null;
      return {
        ...r,
        profile: userProfile || null,
      };
    });

    // 4. Calculate review stats
    const total = enrichedReviews.length;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    enrichedReviews.forEach((r) => {
      const rating = Number(r.rating) || 5;
      if (distribution[rating] !== undefined) {
        distribution[rating] += 1;
      }
      sum += rating;
    });

    const average = total > 0 ? Number((sum / total).toFixed(1)) : 0;

    return {
      product,
      reviews: enrichedReviews,
      stats: {
        total,
        average,
        distribution,
      },
    };
  } catch (err) {
    console.error("Failed to get product reviews:", err);
    return { error: err.message || "Failed to load product reviews." };
  }
}

/**
 * Create a manual product review.
 */
export async function createProductReviewAction(values) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin to add reviews." };
  }

  const parsed = productReviewSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Please check the form inputs and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();

    // Resolve target product
    // Resolve target product safely without UUID type cast errors
    const targetId = String(parsed.data.product_id || "").trim();
    let productQuery = supabase
      .from("products")
      .select("id, public_id, name");

    if (/^\d+$/.test(targetId)) {
      productQuery = productQuery.eq("id", Number(targetId));
    } else if (isUuid(targetId)) {
      productQuery = productQuery.eq("public_id", targetId);
    } else {
      productQuery = productQuery.eq("slug", targetId);
    }

    const { data: product, error: productLookupError } = await productQuery.maybeSingle();

    if (productLookupError || !product) {
      if (productLookupError) {
        console.error("Product lookup failed in createProductReviewAction:", productLookupError);
      }
      return { error: "Target product was not found." };
    }

    const insertPayload = {
      product_id: product.id,
      user_id: parsed.data.user_id && isUuid(parsed.data.user_id) ? parsed.data.user_id : null,
      reviewer_name: parsed.data.reviewer_name.trim(),
      reviewer_email: parsed.data.reviewer_email?.trim() || null,
      rating: parsed.data.rating,
      title: parsed.data.title?.trim() || null,
      comment: parsed.data.comment.trim(),
      is_verified_purchase: Boolean(parsed.data.is_verified_purchase),
      status: parsed.data.status || "approved",
      created_at: parsed.data.created_at
        ? new Date(parsed.data.created_at).toISOString()
        : new Date().toISOString(),
    };

    const { data: review, error: insertError } = await supabase
      .from("product_reviews")
      .insert(insertPayload)
      .select()
      .single();

    if (insertError || !review) {
      return {
        error: formatReviewError(insertError, "Failed to create product review."),
      };
    }

    revalidatePath(`/products/${product.public_id}/reviews`);
    revalidatePath(`/products/${product.id}/reviews`);
    revalidatePath("/products/reviews");
    revalidatePath("/products");

    return {
      success: true,
      review,
      message: "Product review assigned and created successfully.",
    };
  } catch (err) {
    console.error("Error creating review:", err);
    return { error: err.message || "Failed to create product review." };
  }
}

/**
 * Update an existing product review.
 */
export async function updateProductReviewAction(reviewIdentifier, values) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin to update reviews." };
  }

  const parsed = productReviewSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Please check the form inputs and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();

    const rawReviewId = String(reviewIdentifier || "").trim();
    let matchQuery = supabase
      .from("product_reviews")
      .select("id, public_id, product_id, products:product_id(public_id)");

    if (/^\d+$/.test(rawReviewId)) {
      matchQuery = matchQuery.eq("id", Number(rawReviewId));
    } else if (isUuid(rawReviewId)) {
      matchQuery = matchQuery.eq("public_id", rawReviewId);
    } else {
      return { error: "Invalid review identifier." };
    }

    const { data: existing, error: existingError } = await matchQuery.maybeSingle();

    if (existingError || !existing) {
      if (existingError) {
        console.error("Error looking up review to update:", existingError);
      }
      return { error: "Review not found." };
    }

    const updatePayload = {
      user_id: parsed.data.user_id && isUuid(parsed.data.user_id) ? parsed.data.user_id : null,
      reviewer_name: parsed.data.reviewer_name.trim(),
      reviewer_email: parsed.data.reviewer_email?.trim() || null,
      rating: parsed.data.rating,
      title: parsed.data.title?.trim() || null,
      comment: parsed.data.comment.trim(),
      is_verified_purchase: Boolean(parsed.data.is_verified_purchase),
      status: parsed.data.status || "approved",
      ...(parsed.data.created_at
        ? { created_at: new Date(parsed.data.created_at).toISOString() }
        : {}),
    };

    const { data: updated, error: updateError } = await supabase
      .from("product_reviews")
      .update(updatePayload)
      .eq("id", existing.id)
      .select()
      .single();

    if (updateError) {
      return { error: formatReviewError(updateError, "Failed to update review.") };
    }

    if (existing.products?.public_id) {
      revalidatePath(`/products/${existing.products.public_id}/reviews`);
    }
    if (existing.product_id) {
      revalidatePath(`/products/${existing.product_id}/reviews`);
    }
    revalidatePath("/products/reviews");
    revalidatePath("/products");

    return { success: true, review: updated };
  } catch (err) {
    console.error("Error updating review:", err);
    return { error: err.message || "Failed to update review." };
  }
}

/**
 * Toggle/change the status of a review (approved, pending, rejected).
 */
export async function updateProductReviewStatusAction(reviewIdentifier, status) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  if (!["approved", "pending", "rejected"].includes(status)) {
    return { error: "Invalid review status." };
  }

  try {
    const supabase = await createClient();

    const rawReviewId = String(reviewIdentifier || "").trim();
    let query = supabase.from("product_reviews").update({ status });

    if (/^\d+$/.test(rawReviewId)) {
      query = query.eq("id", Number(rawReviewId));
    } else if (isUuid(rawReviewId)) {
      query = query.eq("public_id", rawReviewId);
    } else {
      return { error: "Invalid review identifier." };
    }

    const { data, error } = await query.select("id, public_id, status, product_id, products:product_id(public_id)").single();

    if (error) {
      return { error: formatReviewError(error, "Failed to update review status.") };
    }

    if (data?.products?.public_id) {
      revalidatePath(`/products/${data.products.public_id}/reviews`);
    }
    if (data?.product_id) {
      revalidatePath(`/products/${data.product_id}/reviews`);
    }
    revalidatePath("/products/reviews");

    return { success: true, status: data.status };
  } catch (err) {
    console.error("Error toggling review status:", err);
    return { error: err.message || "Failed to toggle status." };
  }
}

/**
 * Delete a product review.
 */
export async function deleteProductReviewAction(reviewIdentifier) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in as an admin to delete reviews." };
  }

  try {
    const supabase = await createClient();

    const rawReviewId = String(reviewIdentifier || "").trim();
    let lookupQuery = supabase
      .from("product_reviews")
      .select("id, public_id, product_id, products:product_id(public_id)");

    if (/^\d+$/.test(rawReviewId)) {
      lookupQuery = lookupQuery.eq("id", Number(rawReviewId));
    } else if (isUuid(rawReviewId)) {
      lookupQuery = lookupQuery.eq("public_id", rawReviewId);
    } else {
      return { error: "Invalid review identifier." };
    }

    const { data: review, error: lookupError } = await lookupQuery.maybeSingle();

    if (lookupError || !review) {
      if (lookupError) {
        console.error("Error looking up review to delete:", lookupError);
      }
      return { error: "Review not found or already deleted." };
    }

    const { error: deleteError } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", review.id);

    if (deleteError) {
      return { error: formatReviewError(deleteError, "Failed to delete review.") };
    }

    if (review.products?.public_id) {
      revalidatePath(`/products/${review.products.public_id}/reviews`);
    }
    if (review.product_id) {
      revalidatePath(`/products/${review.product_id}/reviews`);
    }
    revalidatePath("/products/reviews");
    revalidatePath("/products");

    return { success: true };
  } catch (err) {
    console.error("Error deleting review:", err);
    return { error: err.message || "Failed to delete review." };
  }
}

/**
 * Global query for reviews across all products (for the main reviews directory).
 */
export async function getAllProductReviewsAction({
  productId = null,
  status = null,
  rating = null,
  search = null,
  limit = 50,
  offset = 0,
} = {}) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("product_reviews")
      .select(`
        id,
        public_id,
        product_id,
        user_id,
        reviewer_name,
        reviewer_email,
        rating,
        title,
        comment,
        is_verified_purchase,
        status,
        created_at,
        updated_at,
        products:product_id (id, public_id, name, slug)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (productId) {
      const pidStr = String(productId).trim();
      if (/^\d+$/.test(pidStr)) {
        query = query.eq("product_id", Number(pidStr));
      } else {
        const filterCol = isUuid(pidStr) ? "public_id" : "slug";
        const { data: prod } = await supabase
          .from("products")
          .select("id")
          .eq(filterCol, pidStr)
          .maybeSingle();
        if (prod?.id) {
          query = query.eq("product_id", prod.id);
        } else {
          return { reviews: [], total: 0 };
        }
      }
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (rating && rating !== "all") {
      query = query.eq("rating", Number(rating));
    }

    if (search && search.trim()) {
      const clean = search.trim();
      query = query.or(
        `reviewer_name.ilike.%${clean}%,reviewer_email.ilike.%${clean}%,title.ilike.%${clean}%,comment.ilike.%${clean}%`
      );
    }

    const { data: reviews, count, error } = await query;

    if (error) {
      console.error("Error fetching all reviews:", error);
      return { reviews: [], total: 0 };
    }

    // Attach profile details if user_id is present
    const userIds = [...new Set((reviews || []).map((r) => r.user_id).filter(Boolean))];
    let profileMap = new Map();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, avatar_url, role")
        .in("id", userIds);

      profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    }

    const enriched = (reviews || []).map((r) => ({
      ...r,
      profile: r.user_id ? profileMap.get(r.user_id) : null,
    }));

    return {
      reviews: enriched,
      total: count || enriched.length,
    };
  } catch (err) {
    console.error("Failed to query all reviews:", err);
    return { reviews: [], total: 0 };
  }
}
