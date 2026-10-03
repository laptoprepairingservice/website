"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  MessageSquare,
  MoreVertical,
  Pencil,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/shadcn/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/shadcn/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/shadcn/components/dropdown-menu";
import { Input } from "@ui/shadcn/components/input";
import {
  deleteProductReviewAction,
  updateProductReviewStatusAction,
} from "../../../_actions/review-actions";
import { cn } from "@/lib/utils";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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

export function ProductReviewsList({
  product,
  reviews = [],
  stats = { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
  onEditReview = null,
  onReviewsChange = null,
  onAddNew = null,
}) {
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (selectedRating !== "all" && String(r.rating) !== String(selectedRating)) {
        return false;
      }
      if (selectedStatus !== "all" && r.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = r.reviewer_name?.toLowerCase().includes(q);
        const matchEmail = r.reviewer_email?.toLowerCase().includes(q);
        const matchTitle = r.title?.toLowerCase().includes(q);
        const matchComment = r.comment?.toLowerCase().includes(q);
        return matchName || matchEmail || matchTitle || matchComment;
      }
      return true;
    });
  }, [reviews, selectedRating, selectedStatus, searchQuery]);

  // Handle status toggle
  const handleStatusChange = async (review, newStatus) => {
    try {
      const res = await updateProductReviewStatusAction(review.public_id || review.id, newStatus);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Review status changed to ${newStatus}.`);
      onReviewsChange?.();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  // Handle review delete
  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteProductReviewAction(reviewToDelete.public_id || reviewToDelete.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Review deleted successfully.");
      setReviewToDelete(null);
      onReviewsChange?.();
    } catch {
      toast.error("Failed to delete review.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 capitalize">
            <CheckCircle2 className="size-3 mr-1" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 capitalize">
            <Clock className="size-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive capitalize">
            <XCircle className="size-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Section 1: Review Statistics & Rating Distribution ── */}
      <Card className="rounded-xl border shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-amber-500 fill-amber-500" />
              <span>Customer Rating Summary</span>
            </div>
            <span className="text-xs text-muted-foreground font-normal">
              {stats.total} total {stats.total === 1 ? "review" : "reviews"} recorded
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-6 sm:grid-cols-12 items-center">
            {/* Left: Overall Score */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center sm:border-r border-border/80 sm:pr-6 text-center">
              <span className="text-5xl font-black text-foreground tracking-tight">
                {stats.total > 0 ? stats.average.toFixed(1) : "—"}
              </span>
              <div className="flex items-center gap-1 my-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "size-4",
                      star <= Math.round(stats.average)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {stats.total} customer {stats.total === 1 ? "rating" : "ratings"}
              </p>
            </div>

            {/* Right: Star Distribution Bars */}
            <div className="sm:col-span-8 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star] || 0;
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                const isSelected = selectedRating === String(star);

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(isSelected ? "all" : String(star))}
                    className={cn(
                      "w-full flex items-center gap-2.5 text-xs rounded-md px-2 py-1 transition-colors text-left cursor-pointer",
                      isSelected ? "bg-muted font-semibold" : "hover:bg-muted/50"
                    )}
                  >
                    <span className="w-10 shrink-0 flex items-center gap-1 font-medium">
                      <span>{star}</span>
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                    </span>

                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <span className="w-14 text-right text-muted-foreground text-[11px] shrink-0">
                      {count} ({pct}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Filters & Search Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card rounded-xl border p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Rating Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {["all", "5", "4", "3", "2", "1"].map((val) => (
              <Button
                key={val}
                type="button"
                variant={selectedRating === val ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRating(val)}
                className="h-7 text-xs px-2.5 cursor-pointer"
              >
                {val === "all" ? "All Stars" : `${val} ★`}
              </Button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            {["all", "approved", "pending", "rejected"].map((st) => (
              <Button
                key={st}
                type="button"
                variant={selectedStatus === st ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedStatus(st)}
                className="h-7 text-xs px-2.5 capitalize cursor-pointer"
              >
                {st}
              </Button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2 size-3.5" />
          <Input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* ── Section 3: Reviews Feed / Cards ── */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const hasProfile = Boolean(review.profile || review.user_id);
            const userProfile = review.profile;

            return (
              <Card key={review.id} className="rounded-xl border shadow-xs overflow-hidden transition-colors hover:border-border/80">
                <CardContent className="p-4 sm:p-5 space-y-3.5">
                  {/* Top Row: Customer Info & Status / Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
                        {getInitials(review.reviewer_name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground text-sm">
                            {review.reviewer_name}
                          </span>

                          {hasProfile && (
                            <Link
                              href={`/users/${review.user_id}`}
                              className="text-[10px] text-primary hover:underline font-medium inline-flex items-center gap-0.5"
                            >
                              <User className="size-2.5" />
                              <span>Registered User</span>
                            </Link>
                          )}

                          {review.is_verified_purchase && (
                            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] px-1.5 py-0 gap-1 font-medium">
                              <ShieldCheck className="size-2.5" />
                              Verified Buyer
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {review.reviewer_email && (
                            <span className="flex items-center gap-1 text-[11px]">
                              <Mail className="size-3" />
                              {review.reviewer_email}
                            </span>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <Calendar className="size-3" />
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(review.status)}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="size-8 cursor-pointer">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 text-xs">
                          <DropdownMenuLabel>Review Actions</DropdownMenuLabel>
                          {onEditReview && (
                            <DropdownMenuItem
                              onClick={() => onEditReview(review)}
                              className="cursor-pointer"
                            >
                              <Pencil className="size-3.5 mr-2" />
                              Edit Review
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[10px] text-muted-foreground font-normal">
                            Change Status:
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(review, "approved")}
                            disabled={review.status === "approved"}
                            className="cursor-pointer text-emerald-600"
                          >
                            <CheckCircle2 className="size-3.5 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(review, "pending")}
                            disabled={review.status === "pending"}
                            className="cursor-pointer text-amber-600"
                          >
                            <Clock className="size-3.5 mr-2" />
                            Mark Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(review, "rejected")}
                            disabled={review.status === "rejected"}
                            className="cursor-pointer text-destructive"
                          >
                            <XCircle className="size-3.5 mr-2" />
                            Reject
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setReviewToDelete(review)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-3.5 mr-2" />
                            Delete Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Middle Row: Stars & Headline */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
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
                      <span className="text-xs font-bold text-foreground">
                        {review.rating}.0
                      </span>
                    </div>

                    {review.title && (
                      <h4 className="font-semibold text-foreground text-sm">
                        {review.title}
                      </h4>
                    )}
                  </div>

                  {/* Bottom Row: Review Description Text */}
                  <div className="bg-muted/20 border border-border/60 rounded-lg p-3 text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                    {review.comment}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="rounded-xl border border-dashed p-8 text-center">
          <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
            <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
              <MessageSquare className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">No Reviews Found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {reviews.length === 0
                  ? "This product does not have any customer reviews yet. Click 'Add Manual Review' to assign the first review."
                  : "No reviews match the selected star or status filters."}
              </p>
            </div>
            {onAddNew && (
              <Button
                type="button"
                onClick={onAddNew}
                size="sm"
                className="font-semibold mt-2 cursor-pointer gap-1.5"
              >
                <Star className="size-3.5" />
                Add First Review
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={Boolean(reviewToDelete)} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Delete Customer Review?</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete this review by{" "}
              <span className="font-semibold text-foreground">{reviewToDelete?.reviewer_name}</span>?
              This will remove the rating score from product aggregates and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReviewToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="gap-1.5 font-semibold"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
