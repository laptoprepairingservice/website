"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Box,
  Check,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  Laptop,
  Layers,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Wrench,
} from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/shadcn/components/card";
import { Separator } from "@ui/shadcn/components/separator";
import { FormSelect } from "@/components/ui/select";
import { scrollToSection } from "./form-utils";

const NAV_ITEMS = [
  { id: "section-basic", label: "General Details", icon: FileText },
  { id: "section-media", label: "Media & Assets", icon: Layers },
  { id: "section-pricing", label: "Pricing & Variant", icon: DollarSign },
  { id: "section-specs", label: "Specifications Table", icon: Wrench },
  { id: "section-compatibility", label: "Device Compatibility", icon: Laptop },
  { id: "section-seo", label: "SEO & JSON-LD", icon: Search },
];

export function ProductStatusCard({ control, register, errors, statusOptions }) {
  return (
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
  );
}

export function ProductFormNav() {
  return (
    <Card className="rounded-xl border shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Form Navigation
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-1">
        {NAV_ITEMS.map((item) => {
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
  );
}

export function ProductMetadataCard({
  initialValues,
  watchSlug,
  selectedBrand,
  selectedCategory,
  watch,
}) {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyPublicId = () => {
    const id = initialValues?.public_id || initialValues?.id;
    if (!id) return;
    navigator.clipboard.writeText(String(id));
    setCopiedId(true);
    toast.success("Product ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
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

        {/* Customer Reviews Page */}
        {(initialValues?.public_id || initialValues?.id) && (
          <div className="pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs gap-1.5 justify-center cursor-pointer hover:bg-primary/5 hover:text-primary hover:border-primary/40"
              asChild
            >
              <Link href={`/products/${initialValues.public_id || initialValues.id}/reviews`}>
                <MessageSquare className="size-3.5 text-amber-500" />
                <span>Customer Reviews</span>
              </Link>
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
  );
}

export function ProductFormSidebar({
  control,
  register,
  errors,
  statusOptions,
  isEdit,
  initialValues,
  watchSlug,
  selectedBrand,
  selectedCategory,
  watch,
}) {
  return (
    <div className="space-y-6 lg:col-span-4">
      <ProductStatusCard
        control={control}
        register={register}
        errors={errors}
        statusOptions={statusOptions}
      />

      <ProductFormNav />

      {isEdit && (
        <ProductMetadataCard
          initialValues={initialValues}
          watchSlug={watchSlug}
          selectedBrand={selectedBrand}
          selectedCategory={selectedCategory}
          watch={watch}
        />
      )}
    </div>
  );
}
