"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  Folder,
  LayoutGrid,
  List as ListIcon,
  Package,
  Pencil,
  Plus,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import List from "@/components/react-list";
import { Button } from "@ui/shadcn/components/button";
import { Badge } from "@ui/shadcn/components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/shadcn/components/dialog";
import { getProductAssetUrl } from "@/lib/supabase/storage";
import { formatPrice } from "@/lib/format";
import { deleteProductAction } from "./_actions/delete-product";

function getProductBannerUrl(product) {
  if (!product?.product_images || product.product_images.length === 0) {
    return null;
  }
  const banner = product.product_images.find((img) => img.is_banner);
  if (banner?.storage_path) {
    return getProductAssetUrl(banner.storage_path);
  }
  const sorted = [...product.product_images].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  return sorted[0]?.storage_path ? getProductAssetUrl(sorted[0].storage_path) : null;
}

function getProductPriceInfo(product) {
  const variants = product?.product_variants || [];
  if (variants.length === 0) {
    return { price: null, compareAt: null, discount: null, count: 0 };
  }
  const defaultVar = variants.find((v) => v.is_default) || variants[0];
  const price = defaultVar?.price != null ? Number(defaultVar.price) : null;
  const compareAt =
    defaultVar?.compare_at_price != null ? Number(defaultVar.compare_at_price) : null;

  let discount = null;
  if (price && compareAt && compareAt > price) {
    discount = Math.round(((compareAt - price) / compareAt) * 100);
  }

  return { price, compareAt, discount, count: variants.length };
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getStatusBadgeVariant(status) {
  switch (status) {
    case "active":
      return "success";
    case "archived":
      return "destructive";
    case "draft":
    default:
      return "secondary";
  }
}

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!productToDelete?.id) return;

    setDeleting(true);
    const result = await deleteProductAction(productToDelete.id);
    setDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Product "${productToDelete.name}" deleted.`);
    setProductToDelete(null);
    handleRefresh();
  };

  const tableColumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => {
          const product = row.original;
          const bannerUrl = getProductBannerUrl(product);
          return (
            <div className="flex items-center gap-3 py-1">
              <div className="border-border bg-muted/30 flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                {bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bannerUrl} alt={product.name} className="size-full object-cover" />
                ) : (
                  <Package className="text-muted-foreground/60 size-4" />
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <Link
                  href={`/products/${product.public_id}/edit`}
                  className="text-foreground hover:text-primary truncate font-medium transition"
                >
                  {product.name}
                </Link>
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  {product.sku && <span className="font-mono">{product.sku}</span>}
                  {product.categories?.name && (
                    <>
                      <span>•</span>
                      <span>{product.categories.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "brand",
        header: "Brand",
        cell: ({ row }) => row.original.brands?.name || "—",
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
          const priceInfo = getProductPriceInfo(row.original);
          if (priceInfo.price == null) return "—";
          return (
            <div className="flex flex-col">
              <span className="text-foreground font-semibold">{formatPrice(priceInfo.price)}</span>
              {priceInfo.compareAt && priceInfo.compareAt > priceInfo.price && (
                <span className="text-muted-foreground text-xs line-through">
                  {formatPrice(priceInfo.compareAt)}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "variants",
        header: "Variants",
        cell: ({ row }) => {
          const count = row.original.product_variants?.length ?? 0;
          return (
            <span className="text-muted-foreground text-xs">
              {count} {count === 1 ? "variant" : "variants"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={getStatusBadgeVariant(row.original.status)} className="capitalize">
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground size-8 cursor-pointer"
              title="Edit product"
            >
              <Link href={`/products/${row.original.public_id}/edit`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 cursor-pointer"
              title="Delete product"
              onClick={(e) => {
                e.stopPropagation();
                setProductToDelete(row.original);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <List
        key={refreshToken}
        title="Products"
        endpoint="products"
        select="id, public_id, name, slug, sku, status, is_oem, is_bestseller, is_featured, created_at, categories(id, name, slug), brands(id, name, slug), product_variants(id, sku, price, compare_at_price, is_default, is_active), product_images(id, storage_path, alt_text, sort_order, is_banner)"
        meta={{ search: "name,sku" }}
        searchPlaceholder="Search products by name or SKU..."
        sortBy="created_at"
        sortOrder="desc"
        columns={viewMode === "table" ? tableColumns : []}
        addItemSlot={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="border-border bg-muted/40 text-muted-foreground inline-flex items-center rounded-lg border p-2">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "cards"
                    ? "bg-background text-foreground shadow-xs"
                    : "hover:text-foreground"
                }`}
                title="Detailed Cards View"
              >
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Detailed</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-xs"
                    : "hover:text-foreground"
                }`}
                title="Compact Table View"
              >
                <ListIcon className="size-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            <Button asChild>
              <Link href="/products/new">
                <Plus className="mr-1.5 size-4" /> Add product
              </Link>
            </Button>
          </div>
        }
      >
        {({ items }) => {
          if (items.length === 0) {
            return null; // Let ReactListEmpty handle this
          }

          return (
            <div className="grid gap-3 pt-2">
              {items.map((product) => {
                const bannerUrl = getProductBannerUrl(product);
                const priceInfo = getProductPriceInfo(product);

                return (
                  <div
                    key={product.id}
                    className="group border-border bg-card/60 hover:bg-card hover:border-primary/40 relative flex flex-col items-start justify-between gap-4 rounded-xl border p-4 transition-all duration-200 hover:shadow-md md:flex-row md:items-center"
                  >
                    {/* Left: Banner Image & Product Info */}
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      {/* Banner Image Container */}
                      <Link
                        href={`/products/${product.public_id}/edit`}
                        className="border-border bg-muted/30 group-hover:border-primary/40 relative h-20 w-28 shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-colors sm:h-24 sm:w-36"
                      >
                        {bannerUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={bannerUrl}
                            alt={product.name}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="text-muted-foreground/60 bg-muted/20 flex size-full flex-col items-center justify-center gap-1">
                            <Package className="size-6" />
                            <span className="text-[10px] font-medium">No banner</span>
                          </div>
                        )}

                        {product.is_bestseller && (
                          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            <Sparkles className="size-2.5" />
                            <span>Bestseller</span>
                          </div>
                        )}
                      </Link>

                      {/* Product Metadata & Badges */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant={getStatusBadgeVariant(product.status)}
                            className="text-[11px] font-semibold capitalize"
                          >
                            {product.status}
                          </Badge>

                          {product.categories?.name && (
                            <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium">
                              <Folder className="size-3" />
                              {product.categories.name}
                            </span>
                          )}

                          {product.brands?.name && (
                            <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium">
                              <Tag className="size-3" />
                              {product.brands.name}
                            </span>
                          )}

                          <span className="border-border/80 text-muted-foreground inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium">
                            {product.is_oem ? "Genuine OEM" : "Compatible"}
                          </span>

                          {product.is_featured && (
                            <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                              Featured
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-foreground group-hover:text-primary truncate text-base font-semibold transition-colors">
                          <Link href={`/products/${product.public_id}/edit`}>{product.name}</Link>
                        </h3>

                        {/* Subtitle / Identifiers */}
                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          {product.sku && (
                            <span className="bg-muted/60 text-foreground/80 rounded px-1.5 py-0.5 font-mono text-[11px] font-medium">
                              SKU: {product.sku}
                            </span>
                          )}
                          <span className="max-w-[220px] truncate">slug: {product.slug}</span>
                          <span>•</span>
                          <span>Added {formatDate(product.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Pricing, Variants, and Action buttons */}
                    <div className="border-border/50 flex shrink-0 items-end justify-between gap-2 self-stretch border-t pt-2 sm:flex-col sm:justify-center sm:self-auto sm:border-t-0 sm:pt-0">
                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1.5">
                          <span className="text-foreground text-lg font-bold">
                            {priceInfo.price != null ? formatPrice(priceInfo.price) : "—"}
                          </span>
                          {priceInfo.compareAt && priceInfo.compareAt > priceInfo.price && (
                            <span className="text-muted-foreground text-xs line-through">
                              {formatPrice(priceInfo.compareAt)}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center justify-end gap-1.5">
                          {priceInfo.discount ? (
                            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              {priceInfo.discount}% off
                            </span>
                          ) : null}
                          <span className="text-muted-foreground text-[11px]">
                            {priceInfo.count} {priceInfo.count === 1 ? "variant" : "variants"}
                          </span>
                        </div>
                      </div>

                      {/* Row Action Buttons */}
                      <div className="flex items-center gap-1 pt-1">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 cursor-pointer px-2.5 text-xs font-medium"
                        >
                          <Link href={`/products/${product.public_id}/edit`}>
                            <Pencil className="mr-1 size-3.5" /> Edit
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 cursor-pointer"
                          title="Delete product"
                          onClick={() => setProductToDelete(product)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }}
      </List>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(productToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setProductToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{productToDelete?.name}&rdquo;? This action
              cannot be undone and will permanently remove this product, its variants, and
              associated images.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setProductToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
