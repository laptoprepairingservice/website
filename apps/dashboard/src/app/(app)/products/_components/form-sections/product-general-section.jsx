"use client";

import { useEffect, useState } from "react";
import { FileText, Link as LinkIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";
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
import { FormSelect } from "@/components/ui/select";
import { FormRichTextEditor } from "@/components/ui/rich-text-editor";
import { slugify } from "../../_lib/slug";
import { FieldError, inputClassName } from "./form-utils";

export function ProductGeneralSection({
  register,
  control,
  errors,
  setValue,
  watch,
  isEdit,
  categoryOptions,
  brandOptions,
  selectedBrand,
  selectedCategory,
  isSubmitting,
}) {
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const productName = watch("name");
  const watchSlug = watch("slug");
  const watchShortDesc = watch("short_description");

  // Auto-generate slug from product name if not manually modified
  useEffect(() => {
    if (isEdit || slugTouched || !productName) {
      return;
    }
    setValue("slug", slugify(productName), { shouldValidate: true });
  }, [isEdit, productName, setValue, slugTouched]);

  return (
    <Card id="section-basic" className="rounded-xl border shadow-xs scroll-mt-24">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <FileText className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">General Information</CardTitle>
            <CardDescription className="text-xs">
              Primary catalog fields displayed on product cards, headers, and listings.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Product Name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="name" className="text-xs font-semibold">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <span className="text-[11px] text-muted-foreground">
              {productName?.length || 0} characters
            </span>
          </div>
          <Input
            id="name"
            placeholder="e.g. Dell Inspiron 15 3511 Backlit Keyboard"
            className={inputClassName}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        {/* Slug with Auto-Sync & Preview */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug" className="text-xs font-semibold">
                URL Slug <span className="text-destructive">*</span>
              </Label>
              {slugTouched && (
                <button
                  type="button"
                  onClick={() => {
                    if (productName) {
                      setValue("slug", slugify(productName), { shouldValidate: true });
                      setSlugTouched(false);
                      toast.info("Slug re-synced with title");
                    }
                  }}
                  className="text-primary hover:text-primary/80 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                >
                  <RotateCcw className="size-2.5" />
                  <span>Sync with title</span>
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                id="slug"
                className={inputClassName}
                placeholder="dell-inspiron-15-keyboard"
                {...register("slug", {
                  onChange: () => setSlugTouched(true),
                })}
              />
            </div>
            <FieldError message={errors.slug?.message} />
          </div>

          {/* SKU */}
          <div className="space-y-1.5">
            <Label htmlFor="sku" className="text-xs font-semibold">
              Product Master SKU <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="sku"
              placeholder="e.g. KB-DEL-3511-BL"
              className={inputClassName}
              {...register("sku")}
            />
            <FieldError message={errors.sku?.message} />
          </div>
        </div>

        {/* URL preview pill */}
        {watchSlug && (
          <div className="bg-muted/40 text-muted-foreground flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs">
            <LinkIcon className="size-3 text-muted-foreground shrink-0" />
            <span className="truncate">
              /
              <span className="text-foreground font-medium">
                {selectedBrand?.slug || "brand"}
              </span>
              /
              <span className="text-foreground font-medium">
                {selectedCategory?.slug || "category"}
              </span>
              /
              <span className="text-primary font-semibold">{watchSlug}</span>
            </span>
          </div>
        )}

        {/* Category & Brand Selectors */}
        <div className="grid gap-4 sm:grid-cols-2 pt-1">
          <FormSelect
            label="Category"
            name="category_id"
            control={control}
            options={categoryOptions}
            error={errors.category_id?.message}
            coerceNumber
            placeholder="Select category"
          />

          <FormSelect
            label="Brand"
            name="brand_id"
            control={control}
            options={brandOptions}
            error={errors.brand_id?.message}
            optional
            optionalLabel="No brand / Generic"
            coerceNumber
          />
        </div>

        {/* Short Description */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="short_description" className="text-xs font-semibold">
              Short Summary <span className="text-muted-foreground font-normal">(Card preview)</span>
            </Label>
            <span className="text-[11px] text-muted-foreground">
              {watchShortDesc?.length || 0} / 250
            </span>
          </div>
          <Textarea
            id="short_description"
            rows={2}
            placeholder="Brief 1-2 sentence overview highlighting part compatibility, condition, and warranty..."
            className="resize-none text-xs"
            {...register("short_description")}
          />
          <FieldError message={errors.short_description?.message} />
        </div>

        {/* Full Description */}
        <div className="pt-1">
          <FormRichTextEditor
            label="Comprehensive Description"
            name="description"
            control={control}
            error={errors.description?.message}
            placeholder="Write detailed specifications, key product features, installation advice, and warranty info..."
            disabled={isSubmitting}
            minHeight="220px"
          />
        </div>
      </CardContent>
    </Card>
  );
}
