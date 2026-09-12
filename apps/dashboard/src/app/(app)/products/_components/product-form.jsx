"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { BreadcrumbSetter } from "@/components/breadcrumb/breadcrumb-setter";
import { FormSwitch } from "@/components/ui/form-switch";
import { FormSelect, toConstantSelectOptions, toSelectOptions } from "@/components/ui/select";
import { FormRichTextEditor } from "@/components/ui/rich-text-editor";
import { createProductAction } from "../_actions/create-product";
import { updateProductAction } from "../_actions/update-product";
import { slugify } from "../_lib/slug";
import {
  getProductFormDefaults,
  PRODUCT_STATUSES,
  productFormSchema,
  updateProductFormSchema,
  VARIANT_CONDITIONS,
} from "../_lib/product-schema";
import { ProductAssetsManager } from "./product-assets-manager";
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

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs";

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="text-destructive text-sm">{message}</p>;
}

function FormSection({ title, description, children }) {
  return (
    <Card className="rounded-xl border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export function ProductForm({ mode, catalogOptions, initialValues }) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const schema = isEdit ? updateProductFormSchema : productFormSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? getProductFormDefaults(),
  });

  const productName = watch("name");
  const breadcrumbs = isEdit
    ? [
        { label: "Products", href: "/products" },
        { label: initialValues?.name || "Edit product" },
      ]
    : [{ label: "Products", href: "/products" }, { label: "New product" }];

  useEffect(() => {
    if (isEdit || slugTouched || !productName) {
      return;
    }

    setValue("slug", slugify(productName), { shouldValidate: true });
  }, [isEdit, productName, setValue, slugTouched]);

  const onSubmit = async (values) => {
    const result = isEdit
      ? await updateProductAction(values)
      : await createProductAction(values);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Product updated." : "Product created.");

    if (isEdit) {
      router.refresh();
      return;
    }

    router.push(`/products/${result.productPublicId}/edit`);
  };

  const categoryOptions = toSelectOptions(catalogOptions.categories);
  const brandOptions = toSelectOptions(catalogOptions.brands);
  const statusOptions = toConstantSelectOptions(PRODUCT_STATUSES);
  const conditionOptions = toConstantSelectOptions(VARIANT_CONDITIONS);

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {isEdit ? "Edit product" : "New product"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isEdit
                ? "Update catalog details and the default sellable variant."
                : "Create a product with one default variant. Inventory tracking starts automatically."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/products">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create product"}
            </Button>
          </div>
        </div>

        <FormSection
          title="Basic details"
          description="Core catalog fields shown on listings and detail pages."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Product name</Label>
              <Input id="name" className={inputClassName} {...register("name")} />
              <FieldError message={errors.name?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                className={inputClassName}
                {...register("slug", {
                  onChange: () => setSlugTouched(true),
                })}
              />
              <FieldError message={errors.slug?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">Product SKU (optional)</Label>
              <Input id="sku" className={inputClassName} {...register("sku")} />
              <FieldError message={errors.sku?.message} />
            </div>

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
              label="Brand (optional)"
              name="brand_id"
              control={control}
              options={brandOptions}
              error={errors.brand_id?.message}
              optional
              optionalLabel="No brand"
              coerceNumber
            />

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="short_description">Short description</Label>
              <Textarea id="short_description" {...register("short_description")} />
              <FieldError message={errors.short_description?.message} />
            </div>

            <div className="md:col-span-2">
              <FormRichTextEditor
                label="Full description"
                name="description"
                control={control}
                error={errors.description?.message}
                placeholder="Write a comprehensive product description with features, warranty, and overview..."
                disabled={isSubmitting}
                minHeight="200px"
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Specifications (TipTap Table)"
          description="Detailed hardware specifications table. Displayed under the Specifications tab on storefront product pages."
        >
          <div className="space-y-2">
            <FormRichTextEditor
              label="Specification Table"
              name="specifications"
              control={control}
              error={errors.specifications?.message}
              placeholder="Use the table tool or click 'Spec Template' above to format a hardware specification table..."
              disabled={isSubmitting}
              minHeight="200px"
            />
          </div>
        </FormSection>

        <FormSection
          title="Compatibility"
        >
          <div className="space-y-2">
            <Label htmlFor="compatibility">Compatible Models & Devices (Optional)</Label>
            <Textarea
              id="compatibility"
              rows={4}
              placeholder={"Enter compatible laptop models or part numbers (one per line or comma-separated)"}
              {...register("compatibility")}
            />
            <FieldError message={errors.compatibility?.message} />
          </div>
        </FormSection>

        <ProductAssetsManager
          productPublicId={initialValues?.public_id || initialValues?.id}
          initialAssets={initialValues?.assets || []}
          onChange={(newAssets) => setValue("assets", newAssets, { shouldDirty: true })}
          disabled={isSubmitting}
        />

        <FormSection
          title="Publishing"
          description="Draft products stay hidden from the storefront."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormSelect
              label="Status"
              name="status"
              control={control}
              options={statusOptions}
              error={errors.status?.message}
            />

            <div className="flex flex-col justify-end gap-3">
              <label htmlFor="is_oem" className="flex items-center gap-2 text-sm cursor-pointer">
                <input id="is_oem" type="checkbox" {...register("is_oem")} />
                Genuine OEM part
              </label>
              <label htmlFor="is_featured" className="flex items-center gap-2 text-sm cursor-pointer">
                <input id="is_featured" type="checkbox" {...register("is_featured")} />
                Featured product
              </label>
              <label htmlFor="is_bestseller" className="flex items-center gap-2 text-sm cursor-pointer">
                <input id="is_bestseller" type="checkbox" {...register("is_bestseller")} />
                <span className="font-medium text-amber-600 dark:text-amber-400">Bestseller product</span>
              </label>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Default variant"
          description="Every product needs at least one variant. Inventory is created automatically for new variants."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="variant_sku">Variant SKU</Label>
              <Input
                id="variant_sku"
                className={inputClassName}
                {...register("default_variant.sku")}
              />
              <FieldError message={errors.default_variant?.sku?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant_name">Variant label</Label>
              <Input
                id="variant_name"
                className={inputClassName}
                placeholder="16GB DDR4 3200MHz"
                {...register("default_variant.variant_name")}
              />
              <FieldError message={errors.default_variant?.variant_name?.message} />
            </div>

            <FormSelect
              label="Condition"
              name="default_variant.condition"
              control={control}
              options={conditionOptions}
              error={errors.default_variant?.condition?.message}
            />

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode (optional)</Label>
              <Input
                id="barcode"
                className={inputClassName}
                {...register("default_variant.barcode")}
              />
              <FieldError message={errors.default_variant?.barcode?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                className={inputClassName}
                {...register("default_variant.price")}
              />
              <FieldError message={errors.default_variant?.price?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compare_at_price">Compare-at price</Label>
              <Input
                id="compare_at_price"
                type="number"
                min="0"
                step="0.01"
                className={inputClassName}
                {...register("default_variant.compare_at_price")}
              />
              <FieldError message={errors.default_variant?.compare_at_price?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost price</Label>
              <Input
                id="cost_price"
                type="number"
                min="0"
                step="0.01"
                className={inputClassName}
                {...register("default_variant.cost_price")}
              />
              <FieldError message={errors.default_variant?.cost_price?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_grams">Weight (grams)</Label>
              <Input
                id="weight_grams"
                type="number"
                min="0"
                step="1"
                className={inputClassName}
                {...register("default_variant.weight_grams")}
              />
              <FieldError message={errors.default_variant?.weight_grams?.message} />
            </div>

            <div className="md:col-span-2">
              <Controller
                name="default_variant.is_active"
                control={control}
                render={({ field }) => (
                  <FormSwitch
                    id="variant-is-active"
                    label="Variant active"
                    description="Inactive variants cannot be sold on the storefront."
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="SEO" description="Optional metadata for search engines.">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta title</Label>
              <Input id="meta_title" className={inputClassName} {...register("meta_title")} />
              <FieldError message={errors.meta_title?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta description</Label>
              <Textarea id="meta_description" {...register("meta_description")} />
              <FieldError message={errors.meta_description?.message} />
            </div>
          </div>
        </FormSection>

        {isEdit ? <input type="hidden" {...register("public_id")} /> : null}
        {isEdit ? <input type="hidden" {...register("default_variant.public_id")} /> : null}
      </form>
    </>
  );
}
