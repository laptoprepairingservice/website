"use client";

import { useCallback, useMemo, useState } from "react";
import { Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import List from "@/components/react-list";
import { BrandSheetForm } from "./_components/brand-sheet-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/shadcn/components/dialog";
import { Button } from "@ui/shadcn/components/button";
import { Badge } from "@ui/shadcn/components/badge";
import { getProductAssetUrl } from "@/lib/supabase/storage";
import { deleteBrandAction } from "./_actions/brand-actions";

export default function BrandsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  function openCreate() {
    setSelectedBrand(null);
    setSheetOpen(true);
  }

  function openEdit(brand) {
    setSelectedBrand(brand);
    setSheetOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!brandToDelete?.id) return;

    setDeleting(true);
    const result = await deleteBrandAction(brandToDelete.id);
    setDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Brand "${brandToDelete.name}" deleted.`);
    setBrandToDelete(null);
    handleRefresh();
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Brand",
        cell: ({ row }) => {
          const logoPath = row.original.logo_path;
          const logoUrl = logoPath ? getProductAssetUrl(logoPath) : null;
          return (
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg overflow-hidden border border-border bg-muted/40 flex items-center justify-center shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={row.original.name}
                    className="size-full object-contain p-1"
                  />
                ) : (
                  <ImageIcon className="size-4 text-muted-foreground/60" />
                )}
              </div>
              <span className="font-medium text-foreground">{row.original.name}</span>
            </div>
          );
        },
      },
      { accessorKey: "slug", header: "Slug" },
      {
        accessorKey: "sort_order",
        header: "Sort Order",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.sort_order ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "website_url",
        header: "Website",
        cell: ({ row }) => row.original.website_url || "—",
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "success" : "secondary"}>
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Edit brand"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(row.original);
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              title="Delete brand"
              onClick={(e) => {
                e.stopPropagation();
                setBrandToDelete(row.original);
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
    <>
      <List
        key={refreshToken}
        title="Brands"
        endpoint="brands"
        select="id, name, slug, logo_path, website_url, description, sort_order, is_active, created_at"
        columns={columns}
        searchPlaceholder="Search brands"
        meta={{ search: "name" }}
        sortBy="sort_order"
        sortOrder="asc"
        addItemSlot={
          <Button type="button" onClick={openCreate}>
            Add brand
          </Button>
        }
        onClick={(row) => openEdit(row)}
      />

      <BrandSheetForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        brand={selectedBrand}
        onSuccess={handleRefresh}
      />

      <Dialog
        open={Boolean(brandToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setBrandToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete brand?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{brandToDelete?.name}&rdquo;? This action cannot be undone and will fail if products still reference this brand.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBrandToDelete(null)}
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
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

