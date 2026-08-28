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
  deleteBrandAction,
  updateBrandAction,
} from "../_actions/brand-actions";
import {
  brandFormSchema,
  getBrandFormDefaults,
  toBrandFormValues,
  updateBrandFormSchema,
} from "../_lib/brand-schema";
import { Button } from "@ui/shadcn/components/button";
import { Input } from "@ui/shadcn/components/input";
import { Label } from "@ui/shadcn/components/label";
import { Textarea } from "@ui/shadcn/components/textarea";

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
  const [deleting, setDeleting] = useState(false);
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
      return;
    }

    reset(brand ? toBrandFormValues(brand) : getBrandFormDefaults());
    setSlugTouched(isEdit);
  }, [open, brand, isEdit, reset]);

  useEffect(() => {
    if (isEdit || slugTouched || !brandName) {
      return;
    }

    setValue("slug", slugify(brandName), { shouldValidate: true });
  }, [brandName, isEdit, setValue, slugTouched]);

  const onSubmit = async (values) => {
    const result = isEdit ? await updateBrandAction(values) : await createBrandAction(values);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Brand updated." : "Brand created.");
    onSuccess?.();
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!brand?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${brand.name}"? This fails if products still reference this brand.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    const result = await deleteBrandAction(brand.id);
    setDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Brand deleted.");
    onSuccess?.();
    onOpenChange(false);
  };

  const loading = isSubmitting || deleting;

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
      footerStart={
        isEdit ? (
          <Button
            type="button"
            variant="destructive"
            className="mr-auto"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </Button>
        ) : null
      }
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
          <Label htmlFor="brand-logo">Logo path</Label>
          <Input
            id="brand-logo"
            className={inputClassName}
            placeholder="brands/dell.webp"
            {...register("logo_path")}
          />
          <FieldError message={errors.logo_path?.message} />
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
