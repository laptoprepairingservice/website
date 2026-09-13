"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormSheet } from "@/components/form-sheet";
import { blogTagSchema, slugify } from "../_lib/blog-schema";
import { createBlogTagAction, updateBlogTagAction } from "../_actions/blog-actions";
import { Input } from "@ui/shadcn/components/input";
import { Label } from "@ui/shadcn/components/label";

const formId = "blog-tag-sheet-form";
const inputClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-destructive text-xs mt-1">{message}</p>;
}

export function BlogTagSheet({ open, onOpenChange, tag = null, onSuccess }) {
  const isEdit = Boolean(tag?.id);
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(blogTagSchema),
    defaultValues: {
      id: tag?.id,
      name: tag?.name ?? "",
      slug: tag?.slug ?? "",
    },
  });

  const tagName = watch("name");

  useEffect(() => {
    if (open) {
      reset({
        id: tag?.id,
        name: tag?.name ?? "",
        slug: tag?.slug ?? "",
      });
      setSlugTouched(Boolean(tag?.id));
    }
  }, [open, tag, reset]);

  useEffect(() => {
    if (isEdit || slugTouched || !tagName) return;
    setValue("slug", slugify(tagName), { shouldValidate: true });
  }, [isEdit, slugTouched, tagName, setValue]);

  const onSubmit = async (values) => {
    const res = isEdit
      ? await updateBlogTagAction({ ...values, id: tag.id })
      : await createBlogTagAction(values);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success(isEdit ? "Blog tag updated!" : "Blog tag created!");
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Blog Tag" : "Add Blog Tag"}
      description="Keywords used to label and discover related blog articles."
      formId={formId}
      loading={isSubmitting}
      submitLabel={isEdit ? "Update Tag" : "Save Tag"}
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="tag-name" className="text-xs font-medium">
            Tag Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tag-name"
            placeholder="e.g. MacBook, Battery, Repairs"
            className={inputClassName}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tag-slug" className="text-xs font-medium">
            Slug <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tag-slug"
            placeholder="macbook"
            className={inputClassName}
            {...register("slug", {
              onChange: () => setSlugTouched(true),
            })}
          />
          <FieldError message={errors.slug?.message} />
        </div>

        {isEdit && <input type="hidden" {...register("id")} />}
      </form>
    </FormSheet>
  );
}
