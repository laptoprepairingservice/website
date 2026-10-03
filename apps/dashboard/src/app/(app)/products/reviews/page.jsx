import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MessageSquare,
  Package,
  ShieldCheck,
  Star,
  User,
  XCircle,
} from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/shadcn/components/card";
import { BreadcrumbSetter } from "@/components/breadcrumb/breadcrumb-setter";
import { getAllProductReviewsAction } from "../_actions/review-actions";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "All Product Reviews | Admin Dashboard",
  description: "View and manage customer reviews across all products in catalog.",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function AllProductReviewsPage() {
  const { reviews = [], total = 0 } = await getAllProductReviewsAction({ limit: 100 });

  const breadcrumbs = [
    { label: "Products", href: "/products" },
    { label: "Product Reviews" },
  ];

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />

      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                Product Reviews
              </h1>
              <Badge variant="secondary" className="font-semibold text-xs">
                {total} Total
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
              Browse, monitor, and manage verified ratings and customer feedback across all products.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" asChild className="font-semibold text-xs">
              <Link href="/products">
                <Package className="size-3.5 mr-1.5" />
                Select Product to Add Review
              </Link>
            </Button>
          </div>
        </div>

        {/* Review Feed */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => {
              const product = review.products;
              const hasProfile = Boolean(review.profile || review.user_id);

              return (
                <Card key={review.id} className="rounded-xl border shadow-xs overflow-hidden transition-colors hover:border-border/80">
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    {/* Header: Product Link & Reviewer Info */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Package className="size-4 text-primary shrink-0" />
                        <span className="text-xs text-muted-foreground">Product:</span>
                        {product ? (
                          <Link
                            href={`/products/${product.public_id}/reviews`}
                            className="text-xs font-semibold text-foreground hover:text-primary transition-colors underline-offset-2 hover:underline truncate max-w-xs sm:max-w-md"
                          >
                            {product.name}
                          </Link>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">Product #{review.product_id}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {review.status === "approved" ? (
                          <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] capitalize">
                            <CheckCircle2 className="size-2.5 mr-1" />
                            Approved
                          </Badge>
                        ) : review.status === "pending" ? (
                          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] capitalize">
                            <Clock className="size-2.5 mr-1" />
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive text-[10px] capitalize">
                            <XCircle className="size-2.5 mr-1" />
                            Rejected
                          </Badge>
                        )}

                        {product && (
                          <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2 cursor-pointer">
                            <Link href={`/products/${product.public_id}/reviews`}>
                              Manage
                              <ExternalLink className="size-3 ml-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Customer & Rating */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
                          {getInitials(review.reviewer_name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-xs sm:text-sm">
                              {review.reviewer_name}
                            </span>

                            {hasProfile && (
                              <Link
                                href={`/users/${review.user_id}`}
                                className="text-[10px] text-primary hover:underline font-medium inline-flex items-center gap-0.5"
                              >
                                <User className="size-2.5" />
                                <span>Customer Profile</span>
                              </Link>
                            )}

                            {review.is_verified_purchase && (
                              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] px-1.5 py-0 gap-1 font-medium">
                                <ShieldCheck className="size-2.5" />
                                Verified Buyer
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            {review.reviewer_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="size-3" />
                                {review.reviewer_email}
                              </span>
                            )}
                            {review.reviewer_email && <span>•</span>}
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "size-3.5",
                                star <= (review.rating || 5)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-foreground ml-1">
                          {review.rating}.0
                        </span>
                      </div>
                    </div>

                    {/* Headline */}
                    {review.title && (
                      <h4 className="font-semibold text-foreground text-xs sm:text-sm pt-1">
                        {review.title}
                      </h4>
                    )}

                    {/* Description Comment */}
                    <div className="bg-muted/20 border border-border/60 rounded-lg p-3 text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                      {review.comment}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="rounded-xl border border-dashed p-10 text-center">
            <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                <MessageSquare className="size-6" />
              </div>
              <h3 className="font-semibold text-base text-foreground">No Reviews in Database</h3>
              <p className="text-xs text-muted-foreground">
                No customer reviews have been submitted or manually assigned yet. Select any product from the catalog to add a manual customer review.
              </p>
              <Button asChild size="sm" className="font-semibold mt-2">
                <Link href="/products">Go to Products List</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
