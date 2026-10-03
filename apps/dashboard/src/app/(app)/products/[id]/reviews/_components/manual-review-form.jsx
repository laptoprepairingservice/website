"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Calendar,
  CheckCircle,
  FileText,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/shadcn/components/card";
import { Input } from "@ui/shadcn/components/input";
import { Label } from "@ui/shadcn/components/label";
import { Textarea } from "@ui/shadcn/components/textarea";
import { FormSwitch } from "@/components/ui/form-switch";
import { FormSelect, toConstantSelectOptions } from "@/components/ui/select";
import {
  getReviewFormDefaults,
  productReviewSchema,
  REVIEW_STATUSES,
} from "../../../_lib/review-schema";
import {
  createProductReviewAction,
  updateProductReviewAction,
} from "../../../_actions/review-actions";
import { UserSelector } from "./user-selector";
import { StarRatingInput } from "./star-rating-input";

export function ManualReviewForm({
  product,
  users = [],
  initialValues = null,
  onSuccess = null,
  onCancel = null,
}) {
  const isEdit = Boolean(initialValues?.id || initialValues?.public_id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productReviewSchema),
    defaultValues:
      initialValues || getReviewFormDefaults({ product_id: product?.id || product?.public_id }),
  });

  const selectedUserId = watch("user_id");
  const reviewerName = watch("reviewer_name");
  const reviewerEmail = watch("reviewer_email");
  const watchComment = watch("comment");

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        product_id: product?.id || product?.public_id,
      };

      const result = isEdit
        ? await updateProductReviewAction(initialValues.public_id || initialValues.id, payload)
        : await createProductReviewAction(payload);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        isEdit
          ? "Product review updated successfully."
          : `Review by ${values.reviewer_name} added to "${product.name}".`
      );

      onSuccess?.(result.review);
    } catch (err) {
      toast.error(err.message || "Failed to save review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = toConstantSelectOptions(REVIEW_STATUSES);

  return (
    <Card className="rounded-xl border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
              <MessageSquare className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {isEdit ? "Edit Product Review" : "Add Manual Customer Review"}
              </CardTitle>
              <CardDescription className="text-xs">
                Assign a verified rating and detailed customer description to{" "}
                <span className="text-foreground font-semibold">{product.name}</span>.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Step 1: User & Reviewer Selection */}
          <UserSelector
            users={users}
            selectedUserId={selectedUserId}
            onSelectUser={(uid) => setValue("user_id", uid, { shouldDirty: true })}
            reviewerName={reviewerName}
            reviewerEmail={reviewerEmail}
            onChangeReviewerName={(name) =>
              setValue("reviewer_name", name, { shouldValidate: true, shouldDirty: true })
            }
            onChangeReviewerEmail={(email) =>
              setValue("reviewer_email", email, { shouldValidate: true, shouldDirty: true })
            }
            errors={{
              reviewer_name: errors.reviewer_name?.message,
              reviewer_email: errors.reviewer_email?.message,
            }}
          />

          {/* Step 2: Rating Selection */}
          <div className="border-border/70 bg-card rounded-xl border p-4">
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <StarRatingInput
                  value={Number(field.value) || 5}
                  onChange={field.onChange}
                  error={errors.rating?.message}
                />
              )}
            />
          </div>

          {/* Step 3: Review Headline & Description */}
          <div className="border-border/70 bg-card space-y-3 rounded-xl border p-4">
            <div className="space-y-1.5">
              <Label htmlFor="review_title" className="text-xs font-semibold">
                Review Headline / Title{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="review_title"
                placeholder="Brief summary headline for the review..."
                className="h-9 text-xs"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-destructive mt-0.5 text-xs">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="review_comment"
                  className="flex items-center gap-1.5 text-xs font-semibold"
                >
                  <FileText className="text-primary size-3" />
                  Review Description / Customer Feedback <span className="text-destructive">*</span>
                </Label>
                <span className="text-muted-foreground text-[11px]">
                  {watchComment?.length || 0} / 3000 characters
                </span>
              </div>
              <Textarea
                id="review_comment"
                rows={4}
                placeholder="Write the full customer review description (e.g. installation experience, performance, compatibility, quality, delivery time)..."
                className="text-xs leading-relaxed"
                {...register("comment")}
              />
              {errors.comment && (
                <p className="text-destructive mt-0.5 text-xs">{errors.comment.message}</p>
              )}
            </div>
          </div>

          {/* Step 4: Metadata, Date & Verification Badges */}
          <div className="border-border/70 bg-card rounded-xl border p-4">
            {/* Status */}
            <div>
              <FormSelect
                label="Publication Status"
                name="status"
                control={control}
                options={statusOptions}
                error={errors.status?.message}
              />
            </div>

            {/* Custom Review Date */}
            <div className="space-y-1.5">
              <Label htmlFor="created_at" className="flex items-center gap-1 text-xs font-semibold">
                <Calendar className="text-primary size-3" />
                Review Date & Time
              </Label>
              <Input
                id="created_at"
                type="datetime-local"
                className="h-9 text-xs"
                {...register("created_at")}
              />
              <p className="text-muted-foreground text-[10px]">
                Set past date to distribute reviews naturally.
              </p>
            </div>

            {/* Verified Purchase Switch */}
            <div className="pt-3 sm:pt-4">
              <Controller
                name="is_verified_purchase"
                control={control}
                render={({ field }) => (
                  <FormSwitch
                    id="is_verified_purchase"
                    label="Verified Purchase"
                    description="Displays the green 'Verified Buyer' badge."
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="cursor-pointer gap-1.5 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving Review...
                </>
              ) : isEdit ? (
                "Update Review"
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  Add Review
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
