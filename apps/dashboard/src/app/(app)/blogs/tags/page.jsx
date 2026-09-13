"use client";

import { useCallback, useMemo, useState } from "react";
import { Hash, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import List from "@/components/react-list";
import { BlogTagSheet } from "../_components/blog-tag-sheet";
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
import { deleteBlogTagAction } from "../_actions/blog-actions";

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

export default function BlogTagsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshToken((val) => val + 1);
  }, []);

  function openCreate() {
    setSelectedTag(null);
    setSheetOpen(true);
  }

  function openEdit(tag) {
    setSelectedTag(tag);
    setSheetOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!tagToDelete?.id) return;

    setDeleting(true);
    const result = await deleteBlogTagAction(tagToDelete.id);
    setDeleting(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Tag "#${tagToDelete.name}" deleted.`);
    setTagToDelete(null);
    handleRefresh();
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Tag",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 py-1">
            <Badge variant="secondary" className="px-2.5 py-1 text-xs gap-1 font-medium">
              <Hash className="size-3 text-muted-foreground" />
              <span>{row.original.name}</span>
            </Badge>
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
              title="Edit tag"
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
              title="Delete tag"
              onClick={(e) => {
                e.stopPropagation();
                setTagToDelete(row.original);
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
        title="Blog Tags"
        endpoint="blog_tags"
        select="id, name, slug, created_at"
        columns={columns}
        searchPlaceholder="Search tags..."
        meta={{ search: "name,slug" }}
        sortBy="name"
        sortOrder="asc"
        addItemSlot={
          <Button type="button" onClick={openCreate} className="gap-1.5">
            <Plus className="size-4" /> Add Tag
          </Button>
        }
        onClick={(row) => openEdit(row)}
      />

      <BlogTagSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        tag={selectedTag}
        onSuccess={handleRefresh}
      />

      <Dialog
        open={Boolean(tagToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setTagToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete tag &ldquo;#{tagToDelete?.name}&rdquo;?
              Articles with this tag will remain intact, but will no longer have this tag assigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTagToDelete(null)}
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
