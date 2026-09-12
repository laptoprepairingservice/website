"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormSwitch } from "@/components/ui/form-switch";

import { FormSheet } from "@/components/form-sheet";
import { slugify } from "@/lib/slug";
import {
  createBrandAction,
  updateBrandAction,
  uploadBrandLogoAction,
} from "../_actions/brand-actions";
import {
  brandFormSchema,
  getBrandFormDefaults,
  toBrandFormValues,
  updateBrandFormSchema,
} from "../_lib/brand-schema";
import { Button } from "@ui/shadcn/components/button";
import { ImageUploader } from "@ui/shadcn/components/image-uploader";
import { Input } from "@ui/shadcn/components/input";
import { Label } from "@ui/shadcn/components/label";
import { Textarea } from "@ui/shadcn/components/textarea";
import { getProductAssetUrl } from "@/lib/supabase/storage";

const formId = "brand-sheet-form";
const inputClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs";

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="text-destructive text-sm">{message}</p>;
}

export function BrandSheetForm({ open, onOpenChange, brand, onSuccess }) {
  const isEdit = Boolean(brand?.id);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imageDeleted, setImageDeleted] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const schema = isEdit ? updateBrandFormSchema : brandFormSchema;

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
    defaultValues: getBrandFormDefaults(),
  });

  const brandName = watch("name");

  useEffect(() => {
    if (!open) {
      setSelectedImageFile(null);
      setImageDeleted(false);
      return;
    }

    reset(brand ? toBrandFormValues(brand) : getBrandFormDefaults());
    setSelectedImageFile(null);
    setImageDeleted(false);
    setSlugTouched(isEdit);
  }, [open, brand, isEdit, reset]);

  useEffect(() => {
    if (isEdit || slugTouched || !brandName) {
      return;
    }

    setValue("slug", slugify(brandName), { shouldValidate: true });
  }, [brandName, isEdit, setValue, slugTouched]);

  const onSubmit = async (values) => {
    let finalLogoPath = values.logo_path;

    if (selectedImageFile) {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", selectedImageFile);
      const uploadRes = await uploadBrandLogoAction(formData);
      setUploadingImage(false);

      if (uploadRes.error) {
        toast.error(uploadRes.error);
        return;
      }
      finalLogoPath = uploadRes.storagePath;
    } else if (imageDeleted) {
      finalLogoPath = null;
    }

    const payload = {
      ...values,
      logo_path: finalLogoPath,
    };

    const result = isEdit ? await updateBrandAction(payload) : await createBrandAction(payload);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Brand updated." : "Brand created.");
    onSuccess?.();
    onOpenChange(false);
  };

  const loading = isSubmitting || uploadingImage;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit brand" : "New brand"}
      description={
        isEdit ? "Update brand details used on product pages." : "Create a manufacturer or brand."
      }
      formId={formId}
      loading={loading}
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brand-name">Name</Label>
          <Input id="brand-name" className={inputClassName} {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-slug">Slug</Label>
          <Input
            id="brand-slug"
            className={inputClassName}
            {...register("slug", { onChange: () => setSlugTouched(true) })}
          />
          <FieldError message={errors.slug?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-sort">Sort order</Label>
          <Input
            id="brand-sort"
            type="number"
            className={inputClassName}
            {...register("sort_order")}
          />
          <FieldError message={errors.sort_order?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-website">Website</Label>
          <Input
            id="brand-website"
            type="url"
            className={inputClassName}
            placeholder="https://example.com"
            {...register("website_url")}
          />
          <FieldError message={errors.website_url?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-description">Description</Label>
          <Textarea id="brand-description" {...register("description")} />
          <FieldError message={errors.description?.message} />
        </div>

        <div className="space-y-2">
          <ImageUploader
            key={open ? (brand?.id ? `brand-${brand.id}-${brand.logo_path}` : "brand-new") : "brand-closed"}
            label="Brand logo"
            helperText="Preview or upload a logo"
            value={
              imageDeleted
                ? ""
                : selectedImageFile
                ? ""
                : brand?.logo_path
                ? getProductAssetUrl(brand.logo_path)
                : watch("logo_path")
                ? getProductAssetUrl(watch("logo_path"))
                : ""
            }
            onFileSelect={(file) => {
              setSelectedImageFile(file);
              setImageDeleted(false);
            }}
            onUrlChange={(url) => {
              setSelectedImageFile(null);
              setImageDeleted(false);
              setValue("logo_path", url, { shouldDirty: true });
            }}
            onDelete={() => {
              setSelectedImageFile(null);
              setImageDeleted(true);
              setValue("logo_path", "", { shouldDirty: true });
            }}
            onReplace={(fileOrUrl) => {
              if (typeof fileOrUrl === "string") {
                setSelectedImageFile(null);
                setImageDeleted(false);
                setValue("logo_path", fileOrUrl, { shouldDirty: true });
              } else {
                setSelectedImageFile(fileOrUrl);
                setImageDeleted(false);
              }
            }}
            error={errors.logo_path?.message}
            disabled={loading}
          />
        </div>

        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <FormSwitch
              id="brand-active"
              label="Active"
              description="Inactive brands are hidden from the storefront."
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
