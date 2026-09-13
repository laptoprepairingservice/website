"use client";

import { useCallback, useMemo, useState } from "react";
import { Folder, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import List from "@/components/react-list";
import { BlogCategorySheet } from "../_components/blog-category-sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/shadcn/components/dialog";
import { Button } from "@ui/shadcn/components/button";
import { deleteBlogCategoryAction } from "../_actions/blog-actions";

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

export default function BlogCategoriesPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshToken((val) => val + 1);
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
    const result = await deleteBlogCategoryAction(categoryToDelete.id);
    setDeleting(false);

    if (result?.error) {
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
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5 py-1">
            <div className="size-8 rounded-lg border border-border bg-muted/40 flex items-center justify-center shrink-0 text-primary">
              <Folder className="size-4" />
            </div>
            <span className="font-medium text-foreground">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">/{row.original.slug}</span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
            {row.original.description || "—"}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{formatDate(row.original.created_at)}</span>
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
        title="Blog Categories"
        endpoint="blog_categories"
        select="id, name, slug, description, created_at, updated_at"
        columns={columns}
        searchPlaceholder="Search categories..."
        meta={{ search: "name,slug" }}
        sortBy="name"
        sortOrder="asc"
        addItemSlot={
          <Button type="button" onClick={openCreate} className="gap-1.5">
            <Plus className="size-4" /> Add Category
          </Button>
        }
        onClick={(row) => openEdit(row)}
      />

      <BlogCategorySheet
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
            <DialogTitle>Delete Category?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete category &ldquo;{categoryToDelete?.name}&rdquo;?
              Articles assigned to this category will remain, but will no longer be linked to this category.
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
