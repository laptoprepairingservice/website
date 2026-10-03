"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  MessageSquarePlus,
  Package,
  Pencil,
  Sparkles,
  Star,
} from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { Button } from "@ui/shadcn/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/shadcn/components/dialog";
import { BreadcrumbSetter } from "@/components/breadcrumb/breadcrumb-setter";
import { ManualReviewForm } from "./manual-review-form";
import { ProductReviewsList } from "./product-reviews-list";

export function ProductReviewsView({ product, reviews = [], stats, users = [] }) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const bannerImage =
    product.product_images?.find((img) => img.is_banner)?.storage_path ||
    product.product_images?.[0]?.storage_path;

  const brandSlug = product.brands?.slug || "brand";
  const categorySlug = product.categories?.slug || "category";
  const storefrontUrl = `http://localhost:3002/${brandSlug}/${categorySlug}/${product.slug}`;

  const breadcrumbs = [
    { label: "Products", href: "/products" },
    { label: product.name, href: `/products/${product.public_id}/edit` },
    { label: "Customer Reviews" },
  ];

  const handleOpenAddForm = () => {
    setEditingReview(null);
    setIsFormOpen(true);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingReview(null);
    router.refresh();
  };

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />

      <div className="space-y-6 pb-20">
        {/* ── Product Header Hero Card ── */}
        <div className="border-border/80 from-card to-muted/20 rounded-2xl border bg-linear-to-b p-5 shadow-xs sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              {/* Product Thumbnail */}
              <div className="border-border/80 bg-muted/40 flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
                {bannerImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`https://adbbngrfbbctqohtozbj.supabase.co/storage/v1/object/public/products/${bannerImage}`}
                    alt={product.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <Package className="text-muted-foreground/60 size-8" />
                )}
              </div>

              <div className="min-w-0">
                <h1 className="text-foreground truncate text-xl font-bold tracking-tight whitespace-pre-wrap sm:text-2xl">
                  {product.name}
                </h1>

                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                  {product.brands?.name && (
                    <span className="text-foreground font-medium">
                      Brand: {product.brands.name}
                    </span>
                  )}
                  {product.brands?.name && product.categories?.name && <span>•</span>}
                  {product.categories?.name && <span>Category: {product.categories.name}</span>}
                  {product.sku && <span>•</span>}
                  {product.sku && <span className="font-mono">SKU: {product.sku}</span>}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="sm" asChild className="cursor-pointer text-xs">
                <Link href={`/products/${product.public_id}/edit`}>
                  <Pencil className="mr-1.5 size-3.5" />
                  Edit Product
                </Link>
              </Button>

              <Button variant="outline" size="sm" asChild className="cursor-pointer text-xs">
                <a href={storefrontUrl} target="_blank" rel="noreferrer">
                  <span>Storefront</span>
                  <ExternalLink className="ml-1.5 size-3 opacity-60" />
                </a>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleOpenAddForm}
                className="cursor-pointer gap-1.5 font-semibold shadow-sm"
              >
                <MessageSquarePlus className="size-4" />
                <span>Add Review</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Main Reviews List & Statistical Overview ── */}
        <ProductReviewsList
          product={product}
          reviews={reviews}
          stats={stats}
          onEditReview={handleEditReview}
          onReviewsChange={() => router.refresh()}
          onAddNew={handleOpenAddForm}
        />

        {/* ── Manual Review Form Dialog / Modal ── */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto p-4 sm:max-w-2xl sm:p-6">
            <ManualReviewForm
              product={product}
              users={users}
              initialValues={editingReview}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
