"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormSheet } from "@/components/form-sheet";
import { blogCategorySchema, slugify } from "../_lib/blog-schema";
import {
  createBlogCategoryAction,
  updateBlogCategoryAction,
} from "../_actions/blog-actions";
import { Input } from "@ui/shadcn/components/input";
import { Label } from "@ui/shadcn/components/label";
import { Textarea } from "@ui/shadcn/components/textarea";

const formId = "blog-category-sheet-form";
const inputClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-destructive text-xs mt-1">{message}</p>;
}

export function BlogCategorySheet({ open, onOpenChange, category = null, onSuccess }) {
  const isEdit = Boolean(category?.id);
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(blogCategorySchema),
    defaultValues: {
      id: category?.id,
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
    },
  });

  const categoryName = watch("name");

  useEffect(() => {
    if (open) {
      reset({
        id: category?.id,
        name: category?.name ?? "",
        slug: category?.slug ?? "",
        description: category?.description ?? "",
      });
      setSlugTouched(Boolean(category?.id));
    }
  }, [open, category, reset]);

  useEffect(() => {
    if (isEdit || slugTouched || !categoryName) return;
    setValue("slug", slugify(categoryName), { shouldValidate: true });
  }, [isEdit, slugTouched, categoryName, setValue]);

  const onSubmit = async (values) => {
    const res = isEdit
      ? await updateBlogCategoryAction({ ...values, id: category.id })
      : await createBlogCategoryAction(values);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success(isEdit ? "Blog category updated!" : "Blog category created!");
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Blog Category" : "Add Blog Category"}
      description="Organize blog posts into thematic topics and sections."
      formId={formId}
      loading={isSubmitting}
      submitLabel={isEdit ? "Update Category" : "Save Category"}
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="cat-name" className="text-xs font-medium">
            Category Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cat-name"
            placeholder="e.g. Hardware Guides, Tech Tips"
            className={inputClassName}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-slug" className="text-xs font-medium">
            Slug <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cat-slug"
            placeholder="hardware-guides"
            className={inputClassName}
            {...register("slug", {
              onChange: () => setSlugTouched(true),
            })}
          />
          <FieldError message={errors.slug?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-description" className="text-xs font-medium">
            Description (optional)
          </Label>
          <Textarea
            id="cat-description"
            placeholder="Brief overview of topics covered in this category"
            rows={4}
            className="text-sm resize-none"
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </div>

        {isEdit && <input type="hidden" {...register("id")} />}
      </form>
    </FormSheet>
  );
}
