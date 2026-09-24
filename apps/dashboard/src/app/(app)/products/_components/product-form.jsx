"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowUpRight,
  Box,
  Check,
  CheckCircle2,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  HelpCircle,
  Laptop,
  Layers,
  Link as LinkIcon,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Wrench,
} from "lucide-react";

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
import { Badge } from "@ui/shadcn/components/badge";
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
import { Separator } from "@ui/shadcn/components/separator";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="text-destructive mt-1 flex items-center gap-1 text-xs font-medium">
      <AlertCircle className="size-3 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

export function ProductForm({ mode, catalogOptions, initialValues }) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [copiedId, setCopiedId] = useState(false);
  const [jsonError, setJsonError] = useState("");
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

  const productName = watch("name");
  const watchSlug = watch("slug");
  const watchStatus = watch("status");
  const watchCategoryId = watch("category_id");
  const watchBrandId = watch("brand_id");
  const watchShortDesc = watch("short_description");
  const watchMetaTitle = watch("meta_title");
  const watchMetaDesc = watch("meta_description");
  const watchCompatibility = watch("compatibility");
  const watchJsonLd = watch("schema_org_jsonld");

  // Pricing calculations
  const priceVal = parseFloat(watch("default_variant.price")) || 0;
  const costVal = parseFloat(watch("default_variant.cost_price")) || 0;
  const compareVal = parseFloat(watch("default_variant.compare_at_price")) || 0;
  const profit = priceVal > 0 && costVal > 0 ? priceVal - costVal : null;
  const margin =
    profit != null && priceVal > 0 ? ((profit / priceVal) * 100).toFixed(1) : null;
  const discountPct =
    compareVal > priceVal ? Math.round(((compareVal - priceVal) / compareVal) * 100) : null;

  // Selected brand and category metadata
  const selectedBrand = useMemo(() => {
    return catalogOptions?.brands?.find((b) => String(b.id) === String(watchBrandId));
  }, [catalogOptions?.brands, watchBrandId]);

  const selectedCategory = useMemo(() => {
    return catalogOptions?.categories?.find((c) => String(c.id) === String(watchCategoryId));
  }, [catalogOptions?.categories, watchCategoryId]);

  // Compatibility chips parsing
  const compatibilityList = useMemo(() => {
    if (!watchCompatibility) return [];
    return watchCompatibility
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [watchCompatibility]);

  const breadcrumbs = isEdit
    ? [
        { label: "Products", href: "/products" },
        { label: initialValues?.name || "Edit product" },
      ]
    : [{ label: "Products", href: "/products" }, { label: "New product" }];

  // Auto-generate slug from product name if not manually modified
  useEffect(() => {
    if (isEdit || slugTouched || !productName) {
      return;
    }
    setValue("slug", slugify(productName), { shouldValidate: true });
  }, [isEdit, productName, setValue, slugTouched]);

  // Validate JSON-LD whenever it changes
  useEffect(() => {
    if (!watchJsonLd || !watchJsonLd.trim()) {
      setJsonError("");
      return;
    }
    try {
      JSON.parse(watchJsonLd);
      setJsonError("");
    } catch {
      setJsonError("Invalid JSON syntax. Ensure double quotes and valid syntax.");
    }
  }, [watchJsonLd]);

  const handleCopyPublicId = () => {
    const id = initialValues?.public_id || initialValues?.id;
    if (!id) return;
    navigator.clipboard.writeText(String(id));
    setCopiedId(true);
    toast.success("Product ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleFormatJson = () => {
    if (!watchJsonLd || !watchJsonLd.trim()) {
      toast.info("No JSON-LD code to format");
      return;
    }
    try {
      const parsed = JSON.parse(watchJsonLd);
      setValue("schema_org_jsonld", JSON.stringify(parsed, null, 2), { shouldDirty: true });
      setJsonError("");
      toast.success("JSON-LD formatted cleanly");
    } catch {
      toast.error("Cannot format invalid JSON. Please check syntax first.");
    }
  };

  const handleGenerateJsonLd = () => {
    const name = watch("name")?.trim();
    if (!name) {
      toast.error("Please enter a product name first before generating schema.");
      return;
    }

    const sku = watch("default_variant.sku") || watch("sku") || "";
    const shortDesc = watch("short_description") || watch("name") || "";
    const condition = watch("default_variant.condition") || "new";
    const isActive = watch("default_variant.is_active");
    const price = watch("default_variant.price") || "0";

    const jsonld = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: name,
      description: shortDesc,
      ...(sku ? { sku: sku } : {}),
      ...(selectedBrand ? { brand: { "@type": "Brand", name: selectedBrand.name } } : {}),
      ...(selectedCategory ? { category: selectedCategory.name } : {}),
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: String(price),
        availability: isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition:
          condition === "new"
            ? "https://schema.org/NewCondition"
            : condition === "refurbished"
            ? "https://schema.org/RefurbishedCondition"
            : "https://schema.org/UsedCondition",
        seller: {
          "@type": "Organization",
          name: "Ranuja Enterprise",
        },
      },
    };

    setValue("schema_org_jsonld", JSON.stringify(jsonld, null, 2), { shouldDirty: true });
    setJsonError("");
    toast.success("Schema.org Product JSON-LD generated!");
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

  // Status visual badge color
  const statusBadgeVariant =
    watchStatus === "active"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
      : watchStatus === "draft"
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
      : "bg-muted text-muted-foreground border-border";

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
        {/* ── Sticky Top Action Bar ── */}
        <div className="bg-background/95 border-border/80 sticky top-0 z-20 -mx-4 flex flex-col gap-3 border-b px-4 py-3.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="text-foreground truncate text-xl font-bold tracking-tight sm:text-2xl">
                  {isEdit ? initialValues?.name || "Edit product" : "New product"}
                </h1>
                <Badge variant="outline" className={cn("capitalize font-semibold", statusBadgeVariant)}>
                  {watchStatus || "draft"}
                </Badge>
                {isDirty && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Unsaved
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                {isEdit
                  ? "Update product catalog details, media assets, pricing, and SEO."
                  : "Fill in product specifications, inventory attributes, and publish to storefront."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href="/products">Cancel</Link>
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold cursor-pointer">
                {isSubmitting ? (
                  <>
                    <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  "Create product"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ── 2-Column Responsive Layout ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ═════════ Main Form Content (Left / 8 cols) ═════════ */}
          <div className="space-y-6 lg:col-span-8">
            {/* Section 1: Overview & Basic Info */}
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

            {/* Section 2: Media & Visual Assets */}
            <div id="section-media" className="scroll-mt-24">
              <ProductAssetsManager
                productPublicId={initialValues?.public_id || initialValues?.id}
                initialAssets={initialValues?.assets || []}
                onChange={(newAssets) => setValue("assets", newAssets, { shouldDirty: true })}
                disabled={isSubmitting}
              />
            </div>

            {/* Section 3: Pricing, Inventory & Default Variant */}
            <Card id="section-pricing" className="rounded-xl border shadow-xs scroll-mt-24">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex size-8 items-center justify-center rounded-lg">
                    <DollarSign className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Pricing & Sellable Variant</CardTitle>
                    <CardDescription className="text-xs">
                      Set consumer prices, calculate margins, assign barcode, and configure fulfillment.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-0">
                {/* Profit & Margin Live Calculator */}
                <div className="bg-muted/30 border-border/80 grid grid-cols-3 gap-2 rounded-xl border p-3 text-center">
                  <div>
                    <span className="text-muted-foreground block text-[11px] font-medium">
                      Selling Price
                    </span>
                    <span className="text-foreground text-sm font-bold sm:text-base">
                      {priceVal > 0 ? `₹${priceVal.toLocaleString("en-IN")}` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px] font-medium">
                      Estimated Profit
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold sm:text-base",
                        profit != null
                          ? profit >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {profit != null ? `₹${profit.toLocaleString("en-IN")}` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px] font-medium">
                      Gross Margin
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold sm:text-base",
                        margin != null
                          ? Number(margin) >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {margin != null ? `${margin}%` : "—"}
                    </span>
                  </div>
                </div>

                {/* Price Fields */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="price" className="text-xs font-semibold">
                      Selling Price (₹) <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs">
                        ₹
                      </span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className={cn(inputClassName, "pl-7 font-medium")}
                        {...register("default_variant.price")}
                      />
                    </div>
                    <FieldError message={errors.default_variant?.price?.message} />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compare_at_price" className="text-xs font-semibold">
                        Original Price (₹)
                      </Label>
                      {discountPct && discountPct > 0 && (
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] text-emerald-600 dark:text-emerald-400">
                          {discountPct}% OFF
                        </Badge>
                      )}
                    </div>
                    <div className="relative">
                      <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs">
                        ₹
                      </span>
                      <Input
                        id="compare_at_price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className={cn(inputClassName, "pl-7")}
                        {...register("default_variant.compare_at_price")}
                      />
                    </div>
                    <FieldError message={errors.default_variant?.compare_at_price?.message} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cost_price" className="text-xs font-semibold">
                      Cost Per Item (₹)
                    </Label>
                    <div className="relative">
                      <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs">
                        ₹
                      </span>
                      <Input
                        id="cost_price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className={cn(inputClassName, "pl-7")}
                        {...register("default_variant.cost_price")}
                      />
                    </div>
                    <FieldError message={errors.default_variant?.cost_price?.message} />
                  </div>
                </div>

                <Separator />

                {/* Variant Attributes */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="variant_sku" className="text-xs font-semibold">
                      Variant SKU <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="variant_sku"
                      className={inputClassName}
                      placeholder="e.g. KB-DEL-3511-NEW"
                      {...register("default_variant.sku")}
                    />
                    <FieldError message={errors.default_variant?.sku?.message} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="variant_name" className="text-xs font-semibold">
                      Variant Label <span className="text-muted-foreground font-normal">(e.g. 16GB / Black)</span>
                    </Label>
                    <Input
                      id="variant_name"
                      className={inputClassName}
                      placeholder="e.g. Standard Black (US Layout)"
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

                  <div className="space-y-1.5">
                    <Label htmlFor="barcode" className="text-xs font-semibold">
                      Barcode / EAN / UPC <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="barcode"
                      className={inputClassName}
                      placeholder="e.g. 8901234567890"
                      {...register("default_variant.barcode")}
                    />
                    <FieldError message={errors.default_variant?.barcode?.message} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="weight_grams" className="text-xs font-semibold">
                      Shipping Weight <span className="text-muted-foreground font-normal">(Grams)</span>
                    </Label>
                    <Input
                      id="weight_grams"
                      type="number"
                      min="0"
                      step="1"
                      className={inputClassName}
                      placeholder="e.g. 250"
                      {...register("default_variant.weight_grams")}
                    />
                    <FieldError message={errors.default_variant?.weight_grams?.message} />
                  </div>

                  <div className="flex items-center pt-5">
                    <Controller
                      name="default_variant.is_active"
                      control={control}
                      render={({ field }) => (
                        <FormSwitch
                          id="variant-is-active"
                          label="Variant Active"
                          description="When inactive, this variant cannot be purchased."
                          checked={Boolean(field.value)}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Specifications (TipTap Table) */}
            <Card id="section-specs" className="rounded-xl border shadow-xs scroll-mt-24">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-sky-500/10 text-sky-600 dark:text-sky-400 flex size-8 items-center justify-center rounded-lg">
                    <Wrench className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Hardware Specifications</CardTitle>
                    <CardDescription className="text-xs">
                      Detailed component specifications table shown under the Specifications tab on storefront product pages.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <FormRichTextEditor
                  label="Specification Table"
                  name="specifications"
                  control={control}
                  error={errors.specifications?.message}
                  placeholder="Use the table tool or click 'Spec Template' to format technical parameters (e.g. Speed, Pins, Voltage, Form Factor)..."
                  disabled={isSubmitting}
                  minHeight="200px"
                />
              </CardContent>
            </Card>

            {/* Section 5: Device Compatibility */}
            <Card id="section-compatibility" className="rounded-xl border shadow-xs scroll-mt-24">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-violet-500/10 text-violet-600 dark:text-violet-400 flex size-8 items-center justify-center rounded-lg">
                    <Laptop className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Device & Model Compatibility</CardTitle>
                    <CardDescription className="text-xs">
                      List supported laptop models, series, or part numbers to help customers verify hardware fit.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <Textarea
                  id="compatibility"
                  rows={4}
                  placeholder="Enter supported laptop models (e.g. Dell Inspiron 15 3511, 3515, 3520, Vostro 3510, Latitude 3420) separated by commas or lines..."
                  className="font-mono text-xs"
                  {...register("compatibility")}
                />
                <FieldError message={errors.compatibility?.message} />

                {compatibilityList.length > 0 && (
                  <div className="pt-1">
                    <span className="text-muted-foreground block text-[11px] mb-1.5 font-medium">
                      Recognized Models ({compatibilityList.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                      {compatibilityList.map((model, idx) => (
                        <Badge key={idx} variant="secondary" className="px-2 py-0.5 text-[11px] font-normal">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 6: Search Engine Optimization & Structured Data (JSON-LD) */}
            <Card id="section-seo" className="rounded-xl border shadow-xs scroll-mt-24">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex size-8 items-center justify-center rounded-lg">
                    <Search className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Search Engine Optimization & Structured Data
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Preview Google search snippets, customize meta tags, and provide Schema.org JSON-LD overrides.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-0">
                {/* Google SERP Search Snippet Preview */}
                <div className="bg-muted/20 border-border/80 space-y-1 rounded-xl border p-4">
                  <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Search Engine Result Preview
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                    <span className="font-semibold text-foreground">ranuja.in</span>
                    <span>›</span>
                    <span>{selectedBrand?.slug || "brand"}</span>
                    <span>›</span>
                    <span>{selectedCategory?.slug || "category"}</span>
                    <span>›</span>
                    <span className="text-primary font-medium">{watchSlug || "product-slug"}</span>
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline cursor-pointer line-clamp-1">
                    {watchMetaTitle || productName || "Product Name | Ranuja Enterprise Ahmedabad"}
                  </div>
                  <div className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                    {watchMetaDesc ||
                      watchShortDesc ||
                      "Buy genuine laptop components and computer parts in Ahmedabad, Gujarat. High quality with manufacturer warranty and fast delivery."}
                  </div>
                </div>

                {/* Meta Title & Description */}
                <div className="grid gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="meta_title" className="text-xs font-semibold">
                        Meta Title
                      </Label>
                      <span
                        className={cn(
                          "text-[11px]",
                          (watchMetaTitle?.length || 0) > 60
                            ? "text-amber-600 font-semibold"
                            : "text-muted-foreground"
                        )}
                      >
                        {watchMetaTitle?.length || 0} / 60 characters
                      </span>
                    </div>
                    <Input
                      id="meta_title"
                      placeholder="e.g. Dell Inspiron 15 Backlit Keyboard | Ranuja"
                      className={inputClassName}
                      {...register("meta_title")}
                    />
                    <FieldError message={errors.meta_title?.message} />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="meta_description" className="text-xs font-semibold">
                        Meta Description
                      </Label>
                      <span
                        className={cn(
                          "text-[11px]",
                          (watchMetaDesc?.length || 0) > 160
                            ? "text-amber-600 font-semibold"
                            : "text-muted-foreground"
                        )}
                      >
                        {watchMetaDesc?.length || 0} / 160 characters
                      </span>
                    </div>
                    <Textarea
                      id="meta_description"
                      rows={2}
                      placeholder="Compelling description to drive clicks from Google search results (recommended 120-160 characters)..."
                      className="resize-none text-xs"
                      {...register("meta_description")}
                    />
                    <FieldError message={errors.meta_description?.message} />
                  </div>
                </div>

                <Separator />

                {/* Schema.org JSON-LD Structured Data Input */}
                <div className="space-y-2.5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Label htmlFor="schema_org_jsonld" className="text-xs font-semibold flex items-center gap-1.5">
                        <FileCode className="size-3.5 text-primary" />
                        Custom Schema.org JSON-LD Structured Data
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Custom JSON-LD schema injected into product page header for rich snippet search results.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleFormatJson}
                        className="h-7 text-xs px-2.5 cursor-pointer"
                      >
                        Format JSON
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleGenerateJsonLd}
                        className="h-7 text-xs px-2.5 gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="size-3 text-amber-500" />
                        <span>Auto-Generate Schema</span>
                      </Button>
                    </div>
                  </div>

                  <Controller
                    name="schema_org_jsonld"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        id="schema_org_jsonld"
                        rows={10}
                        spellCheck={false}
                        placeholder={'{\n  "@context": "https://schema.org/",\n  "@type": "Product",\n  "name": "Product Name",\n  "description": "...",\n  "sku": "KB-123",\n  "offers": {\n    "@type": "Offer",\n    "price": "1499",\n    "priceCurrency": "INR"\n  }\n}'}
                        className="border-input bg-muted/20 focus:bg-background focus:ring-ring w-full rounded-md border p-3 font-mono text-xs focus:ring-1 focus:outline-none resize-y"
                      />
                    )}
                  />

                  {/* Validation status badge */}
                  <div className="flex items-center justify-between pt-1">
                    {watchJsonLd && watchJsonLd.trim() ? (
                      jsonError ? (
                        <span className="text-destructive text-xs flex items-center gap-1 font-medium">
                          <AlertCircle className="size-3.5" />
                          {jsonError}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1 font-medium">
                          <CheckCircle2 className="size-3.5" />
                          Valid JSON-LD Syntax
                        </span>
                      )
                    ) : (
                      <span className="text-muted-foreground text-[11px]">
                        Optional. If left blank, the website automatically builds standard Product structured data.
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ═════════ Sticky Sidebar Column (Right / 4 cols) ═════════ */}
          <div className="space-y-6 lg:col-span-4">
            {/* Card 1: Status & Storefront Flags */}
            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="size-4 text-primary" />
                  Status & Visibility
                </CardTitle>
                <CardDescription className="text-xs">
                  Control product publication state and storefront highlights.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <FormSelect
                  label="Publish Status"
                  name="status"
                  control={control}
                  options={statusOptions}
                  error={errors.status?.message}
                />

                <Separator />

                {/* Flags / Badges */}
                <div className="space-y-2.5">
                  <span className="text-muted-foreground block text-xs font-semibold">
                    Product Badges & Highlights
                  </span>

                  <label
                    htmlFor="is_oem"
                    className="hover:bg-muted/40 flex items-center justify-between rounded-lg border p-2.5 text-xs transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="text-emerald-600 dark:text-emerald-400 size-4 shrink-0" />
                      <div>
                        <span className="text-foreground font-medium block">Genuine OEM Part</span>
                        <span className="text-muted-foreground text-[11px] block">
                          Official manufacturer original part
                        </span>
                      </div>
                    </div>
                    <input
                      id="is_oem"
                      type="checkbox"
                      className="size-4 accent-primary cursor-pointer rounded"
                      {...register("is_oem")}
                    />
                  </label>

                  <label
                    htmlFor="is_featured"
                    className="hover:bg-muted/40 flex items-center justify-between rounded-lg border p-2.5 text-xs transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-primary size-4 shrink-0" />
                      <div>
                        <span className="text-foreground font-medium block">Featured Product</span>
                        <span className="text-muted-foreground text-[11px] block">
                          Highlight in homepage showcases
                        </span>
                      </div>
                    </div>
                    <input
                      id="is_featured"
                      type="checkbox"
                      className="size-4 accent-primary cursor-pointer rounded"
                      {...register("is_featured")}
                    />
                  </label>

                  <label
                    htmlFor="is_bestseller"
                    className="hover:bg-muted/40 flex items-center justify-between rounded-lg border p-2.5 text-xs transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="text-amber-500 size-4 shrink-0" />
                      <div>
                        <span className="text-foreground font-medium block">Bestseller Badge</span>
                        <span className="text-muted-foreground text-[11px] block">
                          Show Bestseller ribbon on store
                        </span>
                      </div>
                    </div>
                    <input
                      id="is_bestseller"
                      type="checkbox"
                      className="size-4 accent-primary cursor-pointer rounded"
                      {...register("is_bestseller")}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Quick Section Jump Navigation */}
            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Form Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                {[
                  { id: "section-basic", label: "General Details", icon: FileText },
                  { id: "section-media", label: "Media & Assets", icon: Layers },
                  { id: "section-pricing", label: "Pricing & Variant", icon: DollarSign },
                  { id: "section-specs", label: "Specifications Table", icon: Wrench },
                  { id: "section-compatibility", label: "Device Compatibility", icon: Laptop },
                  { id: "section-seo", label: "SEO & JSON-LD", icon: Search },
                ].map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <IconComp className="size-3.5 text-primary" />
                        <span>{item.label}</span>
                      </span>
                      <span className="text-[10px] opacity-40">↓</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Card 3: Edit Mode Metadata & Storefront Quick View */}
            {isEdit && (
              <Card className="rounded-xl border shadow-xs bg-muted/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Box className="size-4 text-primary" />
                    Product Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 text-xs">
                  {/* Public ID with copy button */}
                  <div>
                    <span className="text-muted-foreground block text-[11px] mb-1 font-medium">
                      Public Identifier (UUID)
                    </span>
                    <div className="bg-background flex items-center justify-between rounded-lg border px-2.5 py-1.5 font-mono text-[11px]">
                      <span className="truncate max-w-[200px]">
                        {initialValues?.public_id || initialValues?.id || "—"}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPublicId}
                        className="text-muted-foreground hover:text-foreground ml-1 cursor-pointer"
                        title="Copy Public ID"
                      >
                        {copiedId ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Storefront Link */}
                  {watchSlug && (
                    <div className="pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs gap-1.5 justify-center cursor-pointer"
                        asChild
                      >
                        <a
                          href={`http://localhost:3002/${selectedBrand?.slug || "brand"}/${selectedCategory?.slug || "category"}/${watchSlug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Eye className="size-3.5" />
                          <span>View on Storefront</span>
                          <ExternalLink className="size-3 ml-0.5 opacity-60" />
                        </a>
                      </Button>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Variant SKU:</span>
                      <span className="font-mono text-foreground font-medium">
                        {watch("default_variant.sku") || "—"}
                      </span>
                    </div>
                    {initialValues?.created_at && (
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(initialValues.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    {initialValues?.updated_at && (
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>{new Date(initialValues.updated_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {isEdit ? <input type="hidden" {...register("public_id")} /> : null}
        {isEdit ? <input type="hidden" {...register("default_variant.public_id")} /> : null}
      </form>
    </>
  );
}
