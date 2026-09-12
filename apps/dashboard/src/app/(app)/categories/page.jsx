"use client";

import { useCallback, useMemo, useState } from "react";
import { Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import List from "@/components/react-list";
import { CategorySheetForm } from "./_components/category-sheet-form";
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
import { deleteCategoryAction } from "./_actions/category-actions";

export default function CategoriesPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  function openCreate() {
    setSelectedCategory(null);
    setSheetOpen(true);
  }

  function openEdit(category) {
    setSelectedCategory(category);
    setSheetOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete?.id) return;

    setDeleting(true);
    const result = await deleteCategoryAction(categoryToDelete.id);
    setDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Category "${categoryToDelete.name}" deleted.`);
    setCategoryToDelete(null);
    handleRefresh();
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Category",
        cell: ({ row }) => {
          const imagePath = row.original.image_path;
          const imageUrl = imagePath ? getProductAssetUrl(imagePath) : null;
          return (
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg overflow-hidden border border-border bg-muted/40 flex items-center justify-center shrink-0">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={row.original.name}
                    className="size-full object-cover"
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
              title="Edit category"
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
              title="Delete category"
              onClick={(e) => {
                e.stopPropagation();
                setCategoryToDelete(row.original);
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
        title="Categories"
        endpoint="categories"
        select="id, name, slug, parent_id, description, image_path, sort_order, is_active, meta_title, meta_description, created_at"
        columns={columns}
        searchPlaceholder="Search categories"
        meta={{ search: "name" }}
        sortBy="sort_order"
        sortOrder="asc"
        addItemSlot={
          <Button type="button" onClick={openCreate}>
            Add category
          </Button>
        }
        onClick={(row) => openEdit(row)}
      />

      <CategorySheetForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        category={selectedCategory}
        onSuccess={handleRefresh}
      />

      <Dialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setCategoryToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{categoryToDelete?.name}&rdquo;? This action cannot be undone and will fail if products or child categories still reference this category.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
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
