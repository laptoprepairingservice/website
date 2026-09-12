"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormSwitch } from "@/components/ui/form-switch";
import { FormSelect, toSelectOptions } from "@/components/ui/select";

import { FormSheet } from "@/components/form-sheet";
import { slugify } from "@/lib/slug";
import {
  createCategoryAction,
  getCategoryParentOptionsAction,
  updateCategoryAction,
  uploadCategoryImageAction,
} from "../_actions/category-actions";
import {
  categoryFormSchema,
  getCategoryFormDefaults,
  toCategoryFormValues,
  updateCategoryFormSchema,
} from "../_lib/category-schema";
import { Button } from "@ui/shadcn/components/button";
import { ImageUploader } from "@ui/shadcn/components/image-uploader";
import { Input } from "@ui/shadcn/components/input";
import { Label } from "@ui/shadcn/components/label";
import { Textarea } from "@ui/shadcn/components/textarea";
import { getProductAssetUrl } from "@/lib/supabase/storage";

const formId = "category-sheet-form";
const inputClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs";

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="text-destructive text-sm">{message}</p>;
}

export function CategorySheetForm({ open, onOpenChange, category, onSuccess }) {
  const isEdit = Boolean(category?.id);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [parentOptions, setParentOptions] = useState([]);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imageDeleted, setImageDeleted] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const schema = isEdit ? updateCategoryFormSchema : categoryFormSchema;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: getCategoryFormDefaults(),
  });

  const categoryName = watch("name");

  useEffect(() => {
    if (!open) {
      setSelectedImageFile(null);
      setImageDeleted(false);
      return;
    }

    reset(category ? toCategoryFormValues(category) : getCategoryFormDefaults());
    setSelectedImageFile(null);
    setImageDeleted(false);
    setSlugTouched(isEdit);

    getCategoryParentOptionsAction(category?.id).then((result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setParentOptions(result.categories);
    });
  }, [open, category, isEdit, reset]);

  useEffect(() => {
    if (isEdit || slugTouched || !categoryName) {
      return;
    }

    setValue("slug", slugify(categoryName), { shouldValidate: true });
  }, [categoryName, isEdit, setValue, slugTouched]);

  const onSubmit = async (values) => {
    let finalImagePath = values.image_path;

    if (selectedImageFile) {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", selectedImageFile);
      const uploadRes = await uploadCategoryImageAction(formData);
      setUploadingImage(false);

      if (uploadRes.error) {
        toast.error(uploadRes.error);
        return;
      }
      finalImagePath = uploadRes.storagePath;
    } else if (imageDeleted) {
      finalImagePath = null;
    }

    const payload = {
      ...values,
      image_path: finalImagePath,
    };

    const result = isEdit
      ? await updateCategoryAction(payload)
      : await createCategoryAction(payload);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Category updated." : "Category created.");
    onSuccess?.();
    onOpenChange(false);
  };

  const loading = isSubmitting || uploadingImage;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit category" : "New category"}
      description={
        isEdit
          ? "Update category details used across the catalog."
          : "Create a category for organizing products."
      }
      formId={formId}
      loading={loading}
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">Name</Label>
          <Input id="category-name" className={inputClassName} {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-slug">Slug</Label>
          <Input
            id="category-slug"
            className={inputClassName}
            {...register("slug", { onChange: () => setSlugTouched(true) })}
          />
          <FieldError message={errors.slug?.message} />
        </div>

        <FormSelect
          label="Parent category"
          name="parent_id"
          control={control}
          options={toSelectOptions(parentOptions)}
          error={errors.parent_id?.message}
          optional
          optionalLabel="None (top level)"
          coerceNumber
        />

        <div className="space-y-2">
          <Label htmlFor="category-sort">Sort order</Label>
          <Input
            id="category-sort"
            type="number"
            className={inputClassName}
            {...register("sort_order")}
          />
          <FieldError message={errors.sort_order?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-description">Description</Label>
          <Textarea id="category-description" {...register("description")} />
          <FieldError message={errors.description?.message} />
        </div>

        <div className="space-y-2">
          <ImageUploader
            key={open ? (category?.id ? `cat-${category.id}-${category.image_path}` : "cat-new") : "cat-closed"}
            label="Category image"
            helperText="Preview or upload an image"
            value={
              imageDeleted
                ? ""
                : selectedImageFile
                ? ""
                : category?.image_path
                ? getProductAssetUrl(category.image_path)
                : watch("image_path")
                ? getProductAssetUrl(watch("image_path"))
                : ""
            }
            onFileSelect={(file) => {
              setSelectedImageFile(file);
              setImageDeleted(false);
            }}
            onUrlChange={(url) => {
              setSelectedImageFile(null);
              setImageDeleted(false);
              setValue("image_path", url, { shouldDirty: true });
            }}
            onDelete={() => {
              setSelectedImageFile(null);
              setImageDeleted(true);
              setValue("image_path", "", { shouldDirty: true });
            }}
            onReplace={(fileOrUrl) => {
              if (typeof fileOrUrl === "string") {
                setSelectedImageFile(null);
                setImageDeleted(false);
                setValue("image_path", fileOrUrl, { shouldDirty: true });
              } else {
                setSelectedImageFile(fileOrUrl);
                setImageDeleted(false);
              }
            }}
            error={errors.image_path?.message}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-meta-title">Meta title</Label>
          <Input id="category-meta-title" className={inputClassName} {...register("meta_title")} />
          <FieldError message={errors.meta_title?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-meta-description">Meta description</Label>
          <Textarea id="category-meta-description" {...register("meta_description")} />
          <FieldError message={errors.meta_description?.message} />
        </div>

        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <FormSwitch
              id="category-active"
              label="Active"
              description="Inactive categories are hidden from the storefront."
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
            />
          )}
        />

        {isEdit ? <input type="hidden" {...register("id")} /> : null}
      </form>
    </FormSheet>
  );
}
