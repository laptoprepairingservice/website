"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Folder,
  Hash,
  LayoutGrid,
  List as ListIcon,
  Newspaper,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
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
import {
  deleteBlogPostAction,
  updateBlogPostStatusAction,
} from "./_actions/blog-actions";

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
    case "published":
      return "success";
    case "archived":
      return "destructive";
    case "draft":
    default:
      return "secondary";
  }
}

export default function BlogsPage() {
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [statusFilter, setStatusFilter] = useState("all");
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusChangingId, setStatusChangingId] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!postToDelete?.id) return;

    setDeleting(true);
    const result = await deleteBlogPostAction(postToDelete.id);
    setDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Article "${postToDelete.title}" deleted.`);
    setPostToDelete(null);
    handleRefresh();
  };

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    setStatusChangingId(post.id);
    const res = await updateBlogPostStatusAction(post.id, newStatus);
    setStatusChangingId(null);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success(
      newStatus === "published" ? "Article published!" : "Article moved to drafts."
    );
    handleRefresh();
  };

  // Dense Table Columns
  const tableColumns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Article",
        cell: ({ row }) => {
          const post = row.original;
          return (
            <div className="flex items-center gap-3 py-1">
              <div className="size-11 rounded-lg border border-border bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                {post.featured_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <Newspaper className="size-5 text-muted-foreground/60" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <Link
                  href={`/blogs/${post.id}/edit`}
                  className="font-medium text-foreground hover:text-primary transition truncate"
                >
                  {post.title}
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-mono truncate">/{post.slug}</span>
                  {post.reading_time_minutes && (
                    <>
                      <span>•</span>
                      <span>{post.reading_time_minutes} min read</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "categories",
        header: "Categories",
        cell: ({ row }) => {
          const cats = row.original.blog_post_categories || [];
          if (cats.length === 0) return <span className="text-muted-foreground text-xs">—</span>;
          return (
            <div className="flex flex-wrap gap-1 max-w-[180px]">
              {cats.map((c) => (
                <Badge key={c.category_id} variant="secondary" className="text-[10px] py-0">
                  {c.blog_categories?.name}
                </Badge>
              ))}
            </div>
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
        accessorKey: "author",
        header: "Author",
        cell: ({ row }) => {
          const prof = row.original.profiles;
          if (!prof) return <span className="text-muted-foreground text-xs">—</span>;
          const name = [prof.first_name, prof.last_name].filter(Boolean).join(" ");
          return <span className="text-xs text-foreground font-medium">{name || "Admin"}</span>;
        },
      },
      {
        accessorKey: "published_at",
        header: "Date",
        cell: ({ row }) => {
          const date = row.original.published_at || row.original.created_at;
          return <span className="text-xs text-muted-foreground">{formatDate(date)}</span>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const post = row.original;
          return (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                asChild
                variant="ghost"
                size="icon-sm"
                className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Edit article"
              >
                <Link href={`/blogs/${post.id}/edit`}>
                  <Pencil className="size-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                title="Delete article"
                onClick={(e) => {
                  e.stopPropagation();
                  setPostToDelete(post);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Top Header Filter & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
          {["all", "published", "draft", "archived"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition cursor-pointer ${
                statusFilter === st
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "all" ? "All Posts" : st}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
            <Link href="/blogs/categories">
              <Folder className="size-3.5 text-primary" />
              Categories
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
            <Link href="/blogs/tags">
              <Hash className="size-3.5 text-primary" />
              Tags
            </Link>
          </Button>

          {/* View Mode Toggle */}
          <div className="border-border bg-muted/40 text-muted-foreground inline-flex items-center rounded-lg border p-1">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-xs"
                  : "hover:text-foreground"
              }`}
              title="Cards View"
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs"
                  : "hover:text-foreground"
              }`}
              title="Dense Table View"
            >
              <ListIcon className="size-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <Button asChild className="bg-primary hover:bg-primary/90 text-xs">
            <Link href="/blogs/new">
              <Plus className="mr-1.5 size-4" /> New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Main List */}
      <List
        key={`${refreshToken}-${statusFilter}`}
        title="Blog Articles"
        endpoint="blog_posts"
        select="id, title, slug, excerpt, status, published_at, featured_image_url, featured_image_alt, reading_time_minutes, is_featured, created_at, updated_at, profiles(id, first_name, last_name), blog_post_categories(category_id, blog_categories(id, name, slug)), blog_post_tags(tag_id, blog_tags(id, name, slug))"
        meta={{
          search: "title",
          filters: {
            status: { operator: "eq", column: "status" },
          },
        }}
        filters={statusFilter !== "all" ? { status: statusFilter } : {}}
        searchPlaceholder="Search articles by title..."
        sortBy="created_at"
        sortOrder="desc"
        columns={viewMode === "table" ? tableColumns : []}
      >
        {({ items }) => {
          if (viewMode === "table" || items.length === 0) {
            return null;
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
              {items.map((post) => {
                const authorName = post.profiles
                  ? [post.profiles.first_name, post.profiles.last_name].filter(Boolean).join(" ")
                  : "Admin";
                const displayDate = post.published_at || post.created_at;
                const categories = post.blog_post_categories || [];
                const tags = post.blog_post_tags || [];

                return (
                  <div
                    key={post.id}
                    className="group rounded-xl border border-border bg-card/70 hover:bg-card hover:border-primary/40 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col overflow-hidden"
                  >
                    {/* Thumbnail Image Header */}
                    <div className="relative aspect-video w-full bg-muted/40 overflow-hidden border-b">
                      {post.featured_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.featured_image_url}
                          alt={post.featured_image_alt || post.title}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="size-full flex flex-col items-center justify-center text-muted-foreground/50 bg-muted/20 gap-1.5">
                          <Newspaper className="size-8" />
                          <span className="text-[11px] font-medium">No cover image</span>
                        </div>
                      )}

                      {/* Status & Featured badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <Badge
                          variant={getStatusBadgeVariant(post.status)}
                          className="capitalize text-[10px] font-semibold backdrop-blur-xs shadow-xs"
                        >
                          {post.status}
                        </Badge>
                        {post.is_featured && (
                          <Badge className="bg-amber-500 text-white text-[10px] font-bold gap-0.5 shadow-xs">
                            <Sparkles className="size-2.5" /> Featured
                          </Badge>
                        )}
                      </div>

                      {/* Reading time */}
                      {post.reading_time_minutes && (
                        <div className="absolute bottom-2 right-2 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-white flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>{post.reading_time_minutes} min read</span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        {/* Categories pills */}
                        {categories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {categories.map((c) => (
                              <span
                                key={c.category_id}
                                className="text-[10px] font-semibold text-primary uppercase tracking-wider"
                              >
                                #{c.blog_categories?.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Title */}
                        <Link
                          href={`/blogs/${post.id}/edit`}
                          className="font-semibold text-base text-foreground group-hover:text-primary transition line-clamp-2 leading-snug"
                        >
                          {post.title}
                        </Link>

                        {/* Excerpt */}
                        {post.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Footer & Actions */}
                      <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="size-3.5 text-muted-foreground" />
                          <span className="truncate max-w-[90px]">{authorName}</span>
                          <span>•</span>
                          <span>{formatDate(displayDate)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Quick Publish / Unpublish */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={statusChangingId === post.id}
                            onClick={() => handleToggleStatus(post)}
                            className="h-7 px-2 text-xs font-medium"
                            title={post.status === "published" ? "Unpublish to draft" : "Publish article"}
                          >
                            {post.status === "published" ? "Unpublish" : "Publish"}
                          </Button>

                          <Button
                            asChild
                            variant="ghost"
                            size="icon-sm"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Edit"
                          >
                            <Link href={`/blogs/${post.id}/edit`}>
                              <Pencil className="size-3.5" />
                            </Link>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Delete"
                            onClick={() => setPostToDelete(post)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
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
        open={Boolean(postToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setPostToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete blog article?</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &ldquo;{postToDelete?.title}&rdquo;?
              This action cannot be undone and will remove the article and its product references.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPostToDelete(null)}
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
              {deleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
