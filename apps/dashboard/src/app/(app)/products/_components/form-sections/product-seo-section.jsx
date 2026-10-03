"use client";

import { useMemo } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, FileCode, Search, Sparkles } from "lucide-react";
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
import { Separator } from "@ui/shadcn/components/separator";
import { Textarea } from "@ui/shadcn/components/textarea";
import { cn } from "@/lib/utils";
import { FieldError, inputClassName } from "./form-utils";

export function ProductSeoSection({
  register,
  control,
  errors,
  setValue,
  watch,
  selectedBrand,
  selectedCategory,
}) {
  const productName = watch("name");
  const watchSlug = watch("slug");
  const watchShortDesc = watch("short_description");
  const watchMetaTitle = watch("meta_title");
  const watchMetaDesc = watch("meta_description");
  const watchJsonLd = watch("schema_org_jsonld");

  // Validate JSON-LD dynamically without cascading renders
  const jsonError = useMemo(() => {
    if (!watchJsonLd || !watchJsonLd.trim()) {
      return "";
    }
    try {
      JSON.parse(watchJsonLd);
      return "";
    } catch {
      return "Invalid JSON syntax. Ensure double quotes and valid syntax.";
    }
  }, [watchJsonLd]);

  const handleFormatJson = () => {
    if (!watchJsonLd || !watchJsonLd.trim()) {
      toast.info("No JSON-LD code to format");
      return;
    }
    try {
      const parsed = JSON.parse(watchJsonLd);
      setValue("schema_org_jsonld", JSON.stringify(parsed, null, 2), { shouldDirty: true });
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
    toast.success("Schema.org Product JSON-LD generated!");
  };

  return (
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
  );
}
