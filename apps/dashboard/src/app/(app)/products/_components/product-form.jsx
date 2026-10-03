"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { BreadcrumbSetter } from "@/components/breadcrumb/breadcrumb-setter";
import { toConstantSelectOptions, toSelectOptions } from "@/components/ui/select";
import { createProductAction } from "../_actions/create-product";
import { updateProductAction } from "../_actions/update-product";
import {
  getProductFormDefaults,
  PRODUCT_STATUSES,
  productFormSchema,
  updateProductFormSchema,
  VARIANT_CONDITIONS,
} from "../_lib/product-schema";

import {
  FieldError,
  inputClassName,
  scrollToSection,
  ProductFormHeader,
  ProductGeneralSection,
  ProductMediaSection,
  ProductPricingSection,
  ProductSpecificationsSection,
  ProductCompatibilitySection,
  ProductSeoSection,
  ProductFormSidebar,
} from "./form-sections";

export { FieldError, inputClassName };

export function ProductForm({ mode, catalogOptions, initialValues }) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const schema = isEdit ? updateProductFormSchema : productFormSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? getProductFormDefaults(),
  });

  const watchSlug = watch("slug");
  const watchStatus = watch("status");
  const watchCategoryId = watch("category_id");
  const watchBrandId = watch("brand_id");

  // Selected brand and category metadata for previews
  const selectedBrand = useMemo(() => {
    return catalogOptions?.brands?.find((b) => String(b.id) === String(watchBrandId));
  }, [catalogOptions?.brands, watchBrandId]);

  const selectedCategory = useMemo(() => {
    return catalogOptions?.categories?.find((c) => String(c.id) === String(watchCategoryId));
  }, [catalogOptions?.categories, watchCategoryId]);

  const breadcrumbs = isEdit
    ? [
        { label: "Products", href: "/products" },
        { label: initialValues?.name || "Edit product" },
      ]
    : [{ label: "Products", href: "/products" }, { label: "New product" }];

  const onSubmit = async (values) => {
    // If JSON-LD is provided and invalid, block submit
    if (values.schema_org_jsonld && values.schema_org_jsonld.trim()) {
      try {
        JSON.parse(values.schema_org_jsonld);
      } catch {
        toast.error("Please fix the invalid Schema.org JSON-LD syntax before saving.");
        scrollToSection("section-seo");
        return;
      }
    }

    const result = isEdit
      ? await updateProductAction(values)
      : await createProductAction(values);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Product updated successfully." : "Product created successfully.");

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
        {/* Sticky Top Action Bar */}
        <ProductFormHeader
          isEdit={isEdit}
          initialName={initialValues?.name}
          productIdentifier={initialValues?.public_id || initialValues?.id}
          watchStatus={watchStatus}
          isDirty={isDirty}
          isSubmitting={isSubmitting}
        />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Form Content (Left / 8 cols) */}
          <div className="space-y-6 lg:col-span-8">
            <ProductGeneralSection
              register={register}
              control={control}
              errors={errors}
              setValue={setValue}
              watch={watch}
              isEdit={isEdit}
              categoryOptions={categoryOptions}
              brandOptions={brandOptions}
              selectedBrand={selectedBrand}
              selectedCategory={selectedCategory}
              isSubmitting={isSubmitting}
            />

            <ProductMediaSection
              productPublicId={initialValues?.public_id || initialValues?.id}
              initialAssets={initialValues?.assets || []}
              onChange={(newAssets) => setValue("assets", newAssets, { shouldDirty: true })}
              disabled={isSubmitting}
            />

            <ProductPricingSection
              register={register}
              control={control}
              errors={errors}
              conditionOptions={conditionOptions}
              watch={watch}
            />

            <ProductSpecificationsSection
              control={control}
              errors={errors}
              isSubmitting={isSubmitting}
            />

            <ProductCompatibilitySection
              register={register}
              errors={errors}
              watch={watch}
            />

            <ProductSeoSection
              register={register}
              control={control}
              errors={errors}
              setValue={setValue}
              watch={watch}
              selectedBrand={selectedBrand}
              selectedCategory={selectedCategory}
            />
          </div>

          {/* Sticky Sidebar Column (Right / 4 cols) */}
          <ProductFormSidebar
            control={control}
            register={register}
            errors={errors}
            statusOptions={statusOptions}
            isEdit={isEdit}
            initialValues={initialValues}
            watchSlug={watchSlug}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            watch={watch}
          />
        </div>

        {isEdit ? <input type="hidden" {...register("public_id")} /> : null}
        {isEdit ? <input type="hidden" {...register("default_variant.public_id")} /> : null}
      </form>
    </>
  );
}
